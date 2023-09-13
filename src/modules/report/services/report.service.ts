import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import  XLSX from 'xlsx-js-style';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import {
    GlAccountIncomeURL,
    GlAccountExpenseURL,
    OneBudgetURL,
    PropertyBudgetURL,
    GeneralLedgerURL,
} from '../constants/report.constant';
import { ReportDto } from '../dtos/report.create.dto';
import { glAccountService } from 'src/modules/buildium/services/glaccount.service';
import { AssociationService } from 'src/modules/buildium/services/buildium.service';
import { reservesRepository } from 'src/modules/buildium/repository/repositories/reserves.repository';
import { ReportRepository } from '../repository/repositories/report.repository';
import { IDatabaseManyOptions } from 'src/common/database/interfaces/database.interface';
import { budgetsRepository } from 'src/modules/buildium/repository/repositories/budget.repositories';

import { TransactionService } from 'src/modules/buildium/services/transaction.service';
import fs from 'fs';

@Injectable()
export class ReportService {
    constructor(
        private httpService: HttpService,
        private glAccountService: glAccountService,
        private associationService: AssociationService,
        private reservesRepository: reservesRepository,
        private reportRepository: ReportRepository,
        private budgetsRepository: budgetsRepository,
        private transactionService: TransactionService
    ) {}

    async fetchAndGenerateReport(queryParams: ReportDto) {
        if (queryParams.userRole && queryParams.userRole === 'user') {
            const generatedReport: any = await this.getReportDetails(
                queryParams
            );
            return generatedReport.data;
        }

        const where: ReportDto = {
            startdate: queryParams.startdate,
            enddate: queryParams.enddate,
            budgetId: queryParams.budgetId,
            propertyId: queryParams.propertyId,
            selectionentitytype: queryParams.selectionentitytype,
        };

        let report;

        // Check if name is not provided in queryParams
        if (!queryParams.name) {
            const nameDoesNotExistQuery = {
                ...where,
                name: { $exists: false },
            };
            report = await this.reportRepository.findOne(nameDoesNotExistQuery);

            if (
                report &&
                report.data['finalCalculations'] &&
                report.data['finalCalculations'].length > 1
            ) {
                const excludedNames = ['Reserve Transfers', 'Net Income'];
                report.data['finalCalculations'] = report.data[
                    'finalCalculations'
                ].filter(
                    (calculation) => !excludedNames.includes(calculation.name)
                );
                return report.data;
            }
        } else {
            // Name provided, perform standard search
            where.name = queryParams.name;
            report = await this.reportRepository.findOne({ ...where });
        }

        if (report) {
            return report.data;
        } else {
            return await this.generateReport(queryParams);
        }
    }

    async generateReport(queryParams: ReportDto) {
        const GlaccountIncomeConfig = this.defineConfig(GlAccountIncomeURL);
        const GlaccountExpenseConfig = this.defineConfig(GlAccountExpenseURL);
        const BudgetConfig = this.defineConfig(
            OneBudgetURL + queryParams.budgetId
        );

        const incomeObject = await this.glAccountService.findAll({
            Type: 'Income',
        });
        const expenseObject = await this.glAccountService.findAll({
            Type: 'Expense',
        });

        // console.log("expenseObject", expenseObject);

        const [
            GlAccountIncomeResponse,
            GlAccountExpenseResponse,
            budgetResponse,
            // propertyBudgetResponse,
        ] = await Promise.all([
            this.httpService.axiosRef.request(GlaccountIncomeConfig),
            this.httpService.axiosRef.request(GlaccountExpenseConfig),
            this.httpService.axiosRef.request(BudgetConfig),
            // this.httpService.axiosRef.request(PropertyBudgetConfig),
        ]);
        
        // return GlAccountIncomeResponse.data;
        const { result: resultIncome, Ids: incomeIds } =
            await this.ProcessDataToFindBudget(
                GlAccountIncomeResponse.data,
                budgetResponse.data.Details,
                queryParams,
                incomeObject
            );

        const idsArray = incomeObject.map((item) => item['id']);

        console.log("idsArrayidsArray", idsArray);
        

        const transactions = await this.transactionService.findAll(queryParams.propertyId);
        console.log("incomeTransactions",transactions);
        const expenses = [];
        const incomes = [];

        for (const item of transactions) {
            if (item.Journal.Lines[0].GLAccount.Type === "Expense") {
                expenses.push(item);
            } else if (item.Journal.Lines[0].GLAccount.Type === "Income") {
                incomes.push(item);
            }
        }
        

        const resultIncomeWithActual = await this.ProcessDataToFindActual(
            idsArray,
            resultIncome,
            queryParams,
            incomes
        );

        // For Expense
        const { result: resultExpense, Ids: expenseIds } =
            await this.ProcessDataToFindBudget(
                GlAccountExpenseResponse.data,
                budgetResponse.data.Details,
                queryParams,
                expenseObject
            );

        // console.log("resultExpenseresultExpense",resultExpense);

        const resultExpenseWithActual = await this.ProcessDataToFindActual(
            expenseIds,
            resultExpense,
            queryParams,
            expenses
        );
        const currentDate = new Date();

        // Get the current month (1 to 12)
        const currentMonth = currentDate.getMonth() + 1;

        let finalOutput = {
            ...resultIncomeWithActual,
            ...resultExpenseWithActual,
        };
        for (const key in finalOutput) {
            if (Array.isArray(finalOutput[key])) {
                this.calculateProjected2022(finalOutput[key], currentMonth);
            }
        }
        const resultExpenseWithBudgetSum = await this.CalculateBudgetActualSum(
            finalOutput
        );
        const totalSumForExpenseBuget = await this.calculateTotalBudgetExpense(
            finalOutput
        );

        const totalSumForExpenseActual = await this.calculateTotalActualExpense(
            finalOutput
        );
        // total projected sum for expense
        const totalSumForExpenseProjected =
            await this.calculateTotalProjectedExpense(finalOutput);

        const incomeArray = finalOutput['Income'];
        //total budget sum for income
        const totalBudgetSumIncome =
            incomeArray[incomeArray.length - 1].budgetSum;
        //total actual sum for income
        const totalActualSumIncome =
            incomeArray[incomeArray.length - 1].actualSum;

        //total projected sum for income
        const totalProjectedSumIncome =
            incomeArray[incomeArray.length - 1].projected2022Sum;

        const netOperatingIncomeBudget: number =
            totalBudgetSumIncome - totalSumForExpenseBuget;
        const netOperatingIncomeActual: number =
            totalActualSumIncome - totalSumForExpenseActual;
        const netOperatingIncomeProjected: number =
            totalProjectedSumIncome - totalSumForExpenseProjected;

        const twoDigitObjects = finalOutput['Income'].filter(
            (item) => item['id'] >= 10 && item['id'] <= 99
        );

        // Step 2: Remove these objects from their current positions in the array
        twoDigitObjects.forEach((item) => {
            const indexToRemove = finalOutput['Income'].indexOf(item);
            finalOutput['Income'].splice(indexToRemove, 1);
        });

        // Step 3: Insert these objects before the last object in the array
        const indexToInsert = finalOutput['Income'].length - 1;
        finalOutput['Income'].splice(indexToInsert, 0, ...twoDigitObjects);

        finalOutput['finalCalculations'] = [
            {
                name: 'Total for Expense',
                actual: totalSumForExpenseActual,
                budget: totalSumForExpenseBuget,
                projected2022: totalSumForExpenseProjected,
            },
            {
                name: 'Net Operating Income',
                actual: netOperatingIncomeActual,
                budget: netOperatingIncomeBudget,
                projected2022: netOperatingIncomeProjected,
            },
        ];

        finalOutput = this.removeZeroActualAndBudget(finalOutput);
        finalOutput = this.removeZeroTotal(finalOutput);

        // const report = await this.reportRepository.findOne({
        //     startdate: queryParams.startdate,
        //     enddate: queryParams.enddate,
        //     budgetId: queryParams.budgetId,
        //     propertyId: queryParams.propertyId,
        //     selectionentitytype: queryParams.selectionentitytype,
        // });

        // if (!report) {
        //     await this.reportRepository.create({
        //         startdate: queryParams.startdate,
        //         enddate: queryParams.enddate,
        //         budgetId: queryParams.budgetId,
        //         propertyId: queryParams.propertyId,
        //         selectionentitytype: queryParams.selectionentitytype,
        //         name: queryParams.name ? queryParams.name: '',
        //         data: finalOutput,
        //     });
        // }

        if (queryParams.name) {
            const actualReserve: any = await this.calculateResserve(
                queryParams
            );
            const netIncome = netOperatingIncomeActual - actualReserve;
            const netIncomeBUdget = netOperatingIncomeBudget - actualReserve;
            const netIncomeProjected =
                netOperatingIncomeProjected - actualReserve;
            const budgetupcoming = await this.calculateTotalAndTenPercent(
                incomeArray
            );

            finalOutput['finalCalculations'].push(
                {
                    name: 'Reserve Transfers',
                    actual: actualReserve,
                    budget: 0,
                    projected2022: budgetupcoming,
                },
                {
                    name: 'Net Income',
                    actual: netIncome,
                    budget: netIncomeBUdget,
                    projected2022: netIncomeProjected,
                }
            );
        }

        return {
            ...finalOutput,
        };
    }

    defineConfig(url: string) {
        const headers = {
            'x-buildium-client-id': '1aba69ce-2f02-400f-bec0-f97b92717903',
            'x-buildium-client-secret':
                'ZTJ/6h7UCC4Wjpu6KCiebEuXyMhjNzRZfYBIpwnz8jU=',
        };

        const config: AxiosRequestConfig = {
            url,
            method: 'GET',
            headers: { ...headers }, // Spread the headers to avoid circular references
        };
        return config;
    }

    async ProcessDataToFindBudget(
        GlAccountresponse,
        yearBudgetDetails,
        queryParams,
        object
    ) {
        const result = {};
        const Ids = [];
        const months = await this.getMonths(queryParams);
        // const monthsToCalculate = ["January", "February", "March", "April", "May", "June"];

        for (const obj of object) {
            // Check if the GLAccountId from 'obj' exists in yearBudgetDetails
            const existingBudget = yearBudgetDetails.find(
                (budget) => budget.GLAccountId === obj.id
            );

            // If the GLAccountId is not present, add a new object to yearBudgetDetails
            if (!existingBudget) {
                const newBudget = {
                    GLAccountId: obj.id,
                    GLAccountSubType: obj.type,
                    TotalAmount: 0,
                    MonthlyAmounts: {
                        January: 0,
                        February: 0,
                        March: 0,
                        April: 0,
                        May: 0,
                        June: 0,
                        July: 0,
                        August: 0,
                        September: 0,
                        October: 0,
                        November: 0,
                        December: 0,
                    },
                };
                yearBudgetDetails.push(newBudget);
            }
        }

        let sumOfMonths;
        for (const obj of GlAccountresponse) {
            const { Type, SubAccounts, Name, Id, ...rest } = obj;
            const match = yearBudgetDetails.find(
                (item) => item.GLAccountId === obj.Id
            );

            if (!result[Type]) {
                result[Type] = []; // Create an empty array if the Type doesn't exist as a key
            }

            if (match) {
                sumOfMonths = 0;
                for (const month of months) {
                    if (match.MonthlyAmounts.hasOwnProperty(month)) {
                        sumOfMonths += match.MonthlyAmounts[month];
                    }
                }
                result[Type].push({
                    id: Id,
                    name: Name,
                    actual: '',
                    budget: sumOfMonths,
                    projected2022: 0,
                    budget2024: '0',
                    changePercent: '',
                    comment: '',
                });
            }
            Ids.push(obj.Id);
            if (SubAccounts && SubAccounts.length > 0) {
                for (const subObj of SubAccounts) {
                    const subMatch = yearBudgetDetails.find(
                        (item) => item.GLAccountId === subObj.Id
                    );
                    if (!result[Name]) {
                        result[Name] = []; // Create an empty array if the Type2 doesn't exist as a key
                    }
                    if (subMatch) {
                        sumOfMonths = 0;
                        for (const month of months) {
                            if (subMatch.MonthlyAmounts.hasOwnProperty(month)) {
                                sumOfMonths += subMatch.MonthlyAmounts[month];
                            }
                        }
                        result[Name].push({
                            id: subObj.Id,
                            name: subObj.Name,
                            actual: '',
                            budget: sumOfMonths,
                            projected2022: 0,
                            budget2024: '0',
                            changePercent: '',
                            comment: '',
                        });
                    } else {
                        result[Name].push({
                            id: subObj.Id,
                            name: subObj.Name,
                            actual: '',
                            budget: 0,
                            projected2022: 0,
                            budget2024: '0',
                            changePercent: '',
                            comment: '',
                        });
                    }
                    Ids.push(subObj.Id);
                }
            }
        }
        return { result, Ids };
    }

    async calculateResserve(queryParams: ReportDto) {
        const reserve = await this.reservesRepository.findOne({
            Name: queryParams.name,
        });

        const baseGeneralLedgerReserveURL = `${GeneralLedgerURL}&startdate=${queryParams.startdate}&enddate=${queryParams.enddate}&selectionentityid=${queryParams.propertyId}&glaccountids=${reserve.Id}`;
        const GlaccountAssetConfig = this.defineConfig(
            baseGeneralLedgerReserveURL
        );

        const GlAccountAssetResponse = await this.httpService.axiosRef.request(
            GlaccountAssetConfig
        );

        return await this.calculateReserveAmount(GlAccountAssetResponse.data);
    }

    async calculateTotalAndTenPercent(incomeArray) {
        let assessmentsBudget = 0;
        let parkingBudget = 0;

        // Iterate through the "Income" array to find the budgets for the specified names
        for (const item of incomeArray) {
            if (item.name === '3010 - Assessments') {
                assessmentsBudget += item.budget;
            } else if (item.name === '3011 - Parking Assessments') {
                parkingBudget += item.budget;
            }
        }

        // Calculate the total sum of the budgets for the specified names
        const totalSum = assessmentsBudget + parkingBudget;

        // Calculate 10% of the total sum
        const tenPercent = totalSum * 0.1;

        // Return 10% of the total sum if at least one of the names is found, otherwise return 0
        return totalSum > 0 ? tenPercent : 0;
    }

    async calculateReserveAmount(GlAccountAssetResponse) {
        let sum = 0;
        for (const obj of GlAccountAssetResponse) {
            // Check if the "Journal" property exists and contains the "Lines" array
            if (
                obj.Journal &&
                obj.Journal.Lines &&
                Array.isArray(obj.Journal.Lines)
            ) {
                // Iterate through each line inside the "Lines" array
                for (const line of obj.Journal.Lines) {
                    // Check the conditions for "IsCashPosting" and "Memo"
                    if (
                        line.IsCashPosting == false &&
                        line.Memo === 'Transfer' &&
                        line.GLAccount.Name.includes('x Reserve')
                    ) {
                        // Add the "Amount" value to the sum
                        sum += line.Amount;
                    }
                }
            }
        }

        return sum;
    }

    async calculateProjected2022(array, currentMonth) {
        for (const item of array) {
            if (item.hasOwnProperty('actual') && item['actual'] !== 0) {
                item['projected2022'] = parseInt(
                    ((item['actual'] / (currentMonth - 1)) * 12).toFixed(2)
                );
            }
            for (const key in item) {
                if (Array.isArray(item[key])) {
                    this.calculateProjected2022(item[key], currentMonth);
                }
            }
        }
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseManyOptions
    ): Promise<boolean> {
        return this.reportRepository.deleteMany(find, options);
    }

    rearrangeTwoDigitObjects(data) {
        if (!data || !data['Income']) {
            console.error("Invalid data format or missing 'Income' array.");
            return;
        }

        // Step 1: Identify objects with two-digit "id" values
        const twoDigitObjects = data['Income'].filter(
            (item) => item['id'] >= 10 && item['id'] <= 99
        );

        // Step 2: Remove these objects from their current positions in the array
        twoDigitObjects.forEach((item) => {
            const indexToRemove = data['Income'].indexOf(item);
            data['Income'].splice(indexToRemove, 1);
        });

        // Step 3: Insert these objects before the last object in the array
        const indexToInsert = data['Income'].length - 1;
        return data['Income'].splice(indexToInsert, 0, ...twoDigitObjects);
    }

    async calculateTotalBudgetExpense(array) {
        let budgetExpenseSum = 0;
        for (const item in array) {
            if (item !== 'Income') {
                const arr = array[item];
                if (array[item].length > 0) {
                    const obj = arr[arr.length - 1];

                    budgetExpenseSum += obj.budgetSum ? obj.budgetSum : 0;
                }
            }
        }
        return budgetExpenseSum;
    }

    async calculateTotalActualExpense(array) {
        let actualExpenseSum = 0;
        for (const item in array) {
            if (item !== 'Income') {
                const arr = array[item];
                if (array[item].length > 0) {
                    const obj = arr[arr.length - 1];

                    actualExpenseSum += obj.actualSum ? obj.actualSum : 0;
                }
            }
        }

        return actualExpenseSum;
    }

    async calculateTotalProjectedExpense(array) {
        let projectedExpenseSum = 0;
        for (const item in array) {
            if (item !== 'Income') {
                const arr = array[item];
                if (array[item].length > 0) {
                    const obj = arr[arr.length - 1];
                    if (obj.projected2022Sum)
                        projectedExpenseSum += obj.projected2022Sum;
                }
            }
        }
        return projectedExpenseSum;
    }

    async getMonths(queryParams: ReportDto) {
        const months = [];
        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return monthNames;
    }

    async CalculateBudgetActualSum(result) {
        // Iterate through the keys in the data object
        for (const key in result) {
            // Check if the property is an array and not empty
            if (Array.isArray(result[key]) && result[key].length > 0) {
                // Calculate the sum of values for the array
                const budgetSum = this.CalculateBudgetSum(result[key]);
                const actualSum = this.CalculateActualSum(result[key]);
                const projectedSum = this.CalculateProjectedSum(result[key]);
                // Add a separate object at the end of the array to store the sum
                result[key].push({
                    name: 'Total',
                    budgetSum: budgetSum,
                    actualSum: actualSum,
                    projected2022Sum: projectedSum,
                });
            }
        }
        return result;
    }

    async ProcessDataToFindActual(Ids, result, queryParams: ReportDto, transactionsData) {
        const baseGeneralLedgerURL = `${GeneralLedgerURL}0&startdate=${queryParams.startdate}&enddate=${queryParams.enddate}&selectionentityid=${queryParams.propertyId}&glaccountids=${Ids}`;
        const GeneralLedgerConfig = this.defineConfig(baseGeneralLedgerURL);
        const GeneralLedgerResponse = await this.httpService.axiosRef.request(
            GeneralLedgerConfig
        );

        let mergedArray = GeneralLedgerResponse.data;
        for (
            let offset = 999;
            GeneralLedgerResponse.data.length > 0;
            offset += 1000
        ) {
            const baseGeneralLedgerURL = `${GeneralLedgerURL}${offset}&startdate=${queryParams.startdate}&enddate=${queryParams.enddate}&selectionentityid=${queryParams.propertyId}&glaccountids=${Ids}`;
            const GeneralLedgerConfig = this.defineConfig(baseGeneralLedgerURL);

            const GeneralLedgerResponse =
                await this.httpService.axiosRef.request(GeneralLedgerConfig);

            if (GeneralLedgerResponse.data.length > 0) {
                mergedArray = [...mergedArray, ...GeneralLedgerResponse.data];
            } else {
                break;
            }
        }


        // Initialize a dictionary to store the accumulated amounts for each GLAccount ID
        const accumulatedAmounts = {};
        const amountToDeduct = {};
        const names = {};
        // return mergedArray;
        for (const transaction of mergedArray) {
            // Iterate over the "Lines" array of each transaction
            for (const line of transaction.Journal.Lines) {
                // Access properties of each line
                const { GLAccount, Amount, IsCashPosting } = line;
                if (GLAccount.Id === 40024 && !IsCashPosting) {
                    const glAccountId = GLAccount.Id;
                    amountToDeduct[glAccountId] =
                        (amountToDeduct[glAccountId] || 0) + Amount;
                    continue;
                }
                // if (GLAccount.Id === 40101 && Amount === 79.5) {
                //     const glAccountId = GLAccount.Id;
                //     amountToDeduct[glAccountId] =
                //         (amountToDeduct[glAccountId] || 0) + Amount;
                // }
                if(!IsCashPosting && transaction.TransactionType === 'ReverseElectronicFundsTransfer') {
                    // console.log('transaction-----------', transaction);
                    const glAccountId = GLAccount.Id;
                    amountToDeduct[glAccountId] =
                        (amountToDeduct[glAccountId] || 0) + Amount * -1;
                }
                if (
                    IsCashPosting &&
                    (transaction.TransactionType === 'Refund' ||
                        transaction.TransactionType === 'ReversePayment')
                ) {
                    const glAccountId = GLAccount.Id;
                    amountToDeduct[glAccountId] =
                        (amountToDeduct[glAccountId] || 0) + Amount;

                    continue;
                }
                if (
                    GLAccount.Id === 40115 ||
                    // GLAccount.Id === 40101 ||
                    GLAccount.Id === 40102 ||
                    // GLAccount.Id === 40099 ||
                    GLAccount.Id === 40100 ||
                    GLAccount.Id === 40114 ||
                    GLAccount.Id === 40025 ||
                    (IsCashPosting && GLAccount)
                ) {
                    const glAccountId = GLAccount.Id;
                    accumulatedAmounts[glAccountId] =
                        (accumulatedAmounts[glAccountId] || 0) + Amount;
                    names[glAccountId] = GLAccount.Name;
                }
            }
        }

        if(accumulatedAmounts[40024] && amountToDeduct[40024]) {
            accumulatedAmounts[40024] = amountToDeduct[40024];
            amountToDeduct[40024] = 0;
        }

        const missingPairs = Object.entries(names).filter(([key, value]) => {
            const idValue = parseInt(key);
            for (const category in result) {
              if (Array.isArray(result[category])) {
                if (result[category].some(entry => entry.id === idValue)) {
                  return false;
                }
              }
            }
            return true;
          });
          
        const missingObject = missingPairs.reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
        
        console.log("Missing key-value object:", missingObject);
        const result12 = [];

        for (const key in missingObject) {
            if (accumulatedAmounts.hasOwnProperty(key)) {
              result12.push({
                id: parseInt(key),
                name: missingObject[key],
                actual: accumulatedAmounts[key],
                budget: 0,
                projected2022: 0,
                budget2024: "0",
                changePercent: "",
                comment: ""
              });
            }
            result[missingObject[key]] = result12;
        }
        for (const key in result) {
            if (Array.isArray(result[key])) {
                result[key].forEach((item) => {
                    const glAccountId = item.id;
                    if (
                        amountToDeduct[glAccountId] &&
                        amountToDeduct[glAccountId] > 0
                    ) {
                        item.actual =
                            accumulatedAmounts[glAccountId] -
                            amountToDeduct[glAccountId];
                    } else {
                        item.actual = accumulatedAmounts[glAccountId] || 0;
                    }
                });
            }
        }
        return result;
    }

    // async ProcessDataToFindActual(Ids, result, queryParams: ReportDto) {
    //     const baseGeneralLedgerURL = `${GeneralLedgerURL}0&startdate=${queryParams.startdate}&enddate=${queryParams.enddate}&selectionentityid=${queryParams.propertyId}&glaccountids=${Ids}`;
    //     const GeneralLedgerConfig = this.defineConfig(baseGeneralLedgerURL);
    //     const GeneralLedgerResponse = await this.httpService.axiosRef.request(
    //         GeneralLedgerConfig
    //     );
    //     let mergedArray = GeneralLedgerResponse.data;
    //     for (
    //         let offset = 999;
    //         GeneralLedgerResponse.data.length > 0;
    //         offset += 1000
    //     ) {
    //         const baseGeneralLedgerURL = `${GeneralLedgerURL}${offset}&startdate=${queryParams.startdate}&enddate=${queryParams.enddate}&selectionentityid=${queryParams.propertyId}&glaccountids=${Ids}`;
    //         const GeneralLedgerConfig = this.defineConfig(baseGeneralLedgerURL);
    //         const GeneralLedgerResponse =
    //             await this.httpService.axiosRef.request(GeneralLedgerConfig);
    //         if (GeneralLedgerResponse.data.length > 0) {
    //             mergedArray = [...mergedArray, ...GeneralLedgerResponse.data];
    //         } else {
    //             break;
    //         }
    //     }

    //     const accumulatedAmounts = {};
    //     const amountToDeduct = {};
    //     const names = {};
    //     for (const transaction of mergedArray) {
    //         // Iterate over the "Lines" array of each transaction
    //         for (const line of transaction.Journal.Lines) {
    //             // Access properties of each line
    //             const { GLAccount, Amount, IsCashPosting } = line;
    //             // if(GLAccount.Type === 'Income' && GLAccount.Id === 40092) {
    //             //     console.log("GLAccount", GLAccount.Id);
    //             //     console.log(Amount);
    //             // }
    //             if (
    //                 IsCashPosting &&
    //                 (
    //                 transaction.TransactionType === 'Refund' ||
    //                 transaction.TransactionType === 'ReversePayment'
    //                 )
    //             ) {
    //                 const glAccountId = GLAccount.Id;
    //                 amountToDeduct[glAccountId] =
    //                     (amountToDeduct[glAccountId] || 0) + Amount;
    //                 continue;
    //             }
    //             if (GLAccount.Id === 40024 && !IsCashPosting ) {
    //                 const glAccountId = GLAccount.Id;
    //                 amountToDeduct[glAccountId] =
    //                     (amountToDeduct[glAccountId] || 0) + Amount;
    //                 continue;
    //             }
    //             if (GLAccount.Id === 40101 && Amount === 79.5) {
    //                 const glAccountId = GLAccount.Id;
    //                 amountToDeduct[glAccountId] =
    //                     (amountToDeduct[glAccountId] || 0) + Amount;
    //             }
    //             // if(GLAccount.Id === 40092 && Amount === 65.76) {
    //             //     console.log("yesssssssssss");
    //             //     const glAccountId = GLAccount.Id;
    //             //     amountToDeduct[glAccountId] =
    //             //         (amountToDeduct[glAccountId] || 0) + Amount;
    //             // }
    //             if (
    //                 !IsCashPosting &&
    //                 transaction.TransactionType ===
    //                     'ReverseElectronicFundsTransfer'
    //             ) {
    //                 // console.log('transaction-----------', transaction);
    //                 const glAccountId = GLAccount.Id;
    //                 amountToDeduct[glAccountId] =
    //                     (amountToDeduct[glAccountId] || 0) + Amount * -1;
    //             }
    //             if(GLAccount.Id === 39944) {
    //                 console.log(line);
    //             }
    //             if (
    //                 GLAccount.Id === 40115 ||
    //                 GLAccount.Id === 40101 ||
    //                 GLAccount.Id === 40102 ||
    //                 GLAccount.Id === 40114 ||
    //                 (IsCashPosting && GLAccount)
    //             ) {
    //                 const glAccountId = GLAccount.Id;
    //                 accumulatedAmounts[glAccountId] =
    //                     (accumulatedAmounts[glAccountId] || 0) + Amount;
    //                 names[glAccountId] = GLAccount.Name;
    //             }
    //         }
    //     }

    //     // accumulatedAmounts[40024] = amountToDeduct[40024];
    //     // amountToDeduct[40024] = 0;
    //     console.log('amountToDeduct------------', amountToDeduct);
    //     console.log('accumulatedAmounts------------', accumulatedAmounts);
    //     console.log('names------------', names);
    //     // console.log('result------------', result);
    //     for (const key in result) {
    //         if (Array.isArray(result[key])) {
    //             result[key].forEach((item) => {
    //                 // console.log(item);
    //                 const glAccountId = item.id;
    //                 // if(!accumulatedAmounts[glAccountId]) {
    //                 // }
    //                 if (
    //                     amountToDeduct[glAccountId] &&
    //                     amountToDeduct[glAccountId] > 0
    //                 ) {
    //                     item.actual =
    //                         accumulatedAmounts[glAccountId] -
    //                         amountToDeduct[glAccountId];
    //                 } else {
    //                     item.actual = accumulatedAmounts[glAccountId] || 0;
    //                 }
    //             });
    //         }
    //     }
    //     return result;
    // }

    CalculateBudgetSum(array: any[]) {
        return array.reduce((total, item) => total + item.budget, 0);
    }

    CalculateActualSum(array: any[]) {
        return array.reduce(
            (total, item) =>
                total + (typeof item.actual === 'number' ? item.actual : 0),
            0
        );
    }
    CalculateProjectedSum(array: any[]) {
        return parseInt(
            array.reduce(
                (total, item) =>
                    total +
                    parseInt(item.projected2022 ? item.projected2022 : 0),
                0
            )
        );
    }

    removeZeroActualAndBudget(data) {
        const updatedData = {};

        for (const sectionKey in data) {
            if (data.hasOwnProperty(sectionKey)) {
                updatedData[sectionKey] = data[sectionKey].filter(
                    (record) => record.actual !== 0 || record.budget !== 0
                );
            }
        }

        return updatedData;
    }

    async extractValues(data) {
        const rows = [];

        function traverse(obj) {
            for (const key in obj) {
                if (Array.isArray(obj[key])) {
                    const row = [key]; // Add the key to the row
                    rows.push(row);

                    obj[key].forEach((item) => {
                        const subRow = [];
                        for (const prop in item) {
                            if (prop !== 'id') {
                                subRow.push(item[prop]);
                            }
                        }
                        rows.push(subRow);
                    });
                } else if (typeof obj[key] === 'object') {
                    traverse(obj[key]);
                }
            }
        }

        traverse(data);
        return rows;
    }

    async generateReportBlob(body: any) {
        if (body.userType === 'superadmin') {
            await this.saveUpdatedReport(body);
        }
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        let rows = await this.extractValues(body.gridData);
        rows = rows.filter((row) => row[0] !== 'finalCalculations');
        const budgetYear = await this.getBudgetYear(body.budgetId);
        const workbook = XLSX.utils.book_new();
        const excelHeaders = [
            'Account',
            'Actual',
            'Budget',
            `${budgetYear} Projected`,
            `${budgetYear + 1} Budget`,
            '% change',
            'comments',
        ];

        const wsData: any = [
            ['Budget vs. Actual'],
            ['Cash Basis'],
            [
                'Water, elevator, insurance, montoring, payroll, loans, snow, landscaping - not all monthly and need manager review',
            ],
            [`${budgetYear + 1} Budget`],
            [`${body.propertyName}`],
            [`${body.startDate} - ${body.endDate}`],
            excelHeaders,
            ...rows,
        ];

        wsData[0][0] = {
            v: wsData[0][0],
            s: {
                font: {
                    sz: 11,
                    bold: true,
                },
                alignment: {
                    horizontal: 'left',
                    vertical: 'center',
                    wrapText: true,
                },
            },
        };
        wsData[1][0] = {
            v: wsData[1][0],
            s: {
                font: {
                    sz: 11,
                    bold: true,
                },
                alignment: {
                    horizontal: 'left',
                    vertical: 'center',
                    wrapText: true,
                },
            },
        };
        wsData[2][0] = {
            v: wsData[2][0],
            s: {
                font: {
                    sz: 11,
                    bold: true,
                },
                alignment: {
                    horizontal: 'left',
                    vertical: 'center',
                    wrapText: true,
                },
            },
        };
        wsData[3][0] = {
            v: wsData[3][0],
            s: {
                font: {
                    sz: 11,
                    bold: true,
                },
                alignment: {
                    horizontal: 'left',
                    vertical: 'center',
                    wrapText: true,
                },
            },
        };
        wsData[4][0] = {
            v: wsData[4][0],
            s: {
                font: {
                    sz: 11,
                    bold: true,
                },
                alignment: {
                    horizontal: 'left',
                    vertical: 'center',
                    wrapText: true,
                },
            },
        };
        wsData[5][0] = {
            v: wsData[5][0],
            s: {
                font: {
                    sz: 11,
                    bold: true,
                },
                alignment: {
                    horizontal: 'left',
                    vertical: 'center',
                    wrapText: true,
                },
            },
        };

        const worksheet1 = XLSX.utils.aoa_to_sheet(wsData);
        // Set the formula and format the "Projected" column
        const range = XLSX.utils.decode_range(worksheet1['!ref']);
        const projectedColIndex = 3; // Column index of '2022 Projected'
        const changePercentColIndex = 5; // Column index of '% change'
        const firstDataRow = 7; // First data row (excluding header)
        let count = firstDataRow + 2;
        let start = count;
        const cellArray = [];
        let columnCounter = 1;
        let incomeRow = 0;
        let expenseRowValue = 0;
        let netOperatingIncomeRowValue = 0;
        let reservTansferRow = 0;

        // Apply bold formatting to header row
        for (let colNum = 0; colNum < excelHeaders.length; colNum++) {
            const headerCell =
                worksheet1[XLSX.utils.encode_cell({ r: 6, c: colNum })];
            if (headerCell && colNum === 0) {
                headerCell.s = {
                    font: {
                        sz: 11,
                        bold: true,
                    },
                    alignment: {
                        horizontal: 'left',
                        vertical: 'center',
                        wrapText: true,
                    },
                };
            } else if (headerCell) {
                headerCell.s = {
                    font: {
                        sz: 11,
                        bold: true,
                    },
                    alignment: {
                        horizontal: 'right',
                        vertical: 'center',
                        wrapText: true,
                    },
                };
            }
        }

        for (let rowNum = firstDataRow; rowNum <= range.e.r; rowNum++) {
            const cellProjected =
                worksheet1[
                    XLSX.utils.encode_cell({ r: rowNum, c: projectedColIndex })
                ];
            const cellChangePercent =
                worksheet1[
                    XLSX.utils.encode_cell({
                        r: rowNum,
                        c: changePercentColIndex,
                    })
                ];
            const cellActual =
                worksheet1[XLSX.utils.encode_cell({ r: rowNum, c: 1 })];
            const cellBudget =
                worksheet1[XLSX.utils.encode_cell({ r: rowNum, c: 2 })];
            const cellYearBudget =
                worksheet1[XLSX.utils.encode_cell({ r: rowNum, c: 4 })];
            const accountTotal =
                worksheet1[XLSX.utils.encode_cell({ r: rowNum, c: 0 })];

            // Check if the row starts with "Total" string
            const rowData = rows[rowNum - firstDataRow];
            const isTotalRow = rowData[0].includes('Total');

            const hasNetOperatingIncome = rowData.includes(
                'Net Operating Income'
            );
            const hasReserveTransfers = rowData.includes('Reserve Transfers');
            const hasNetIncome = rowData.includes('Net Income');
            const totalForExpense = rowData.includes('Total for Expense');
            const totalForIncome = rowData.includes('Total for Income');

            if (
                isTotalRow ||
                hasNetOperatingIncome ||
                hasReserveTransfers ||
                hasNetIncome ||
                rowData.length === 1
            ) {
                // Apply bold formatting to all cells in the row
                if (hasReserveTransfers) {
                    reservTansferRow = rowNum + 1;
                }
                for (let colNum = 0; colNum < excelHeaders.length; colNum++) {
                    const cell =
                        worksheet1[
                            XLSX.utils.encode_cell({ r: rowNum, c: colNum })
                        ];
                    if (cell && colNum === 0) {
                        cell.s = {
                            font: {
                                sz: 11,
                                bold: true,
                            },
                            alignment: {
                                horizontal: 'left',
                                vertical: 'center',
                                wrapText: true,
                            },
                        };
                    } else if (cell) {
                        cell.s = {
                            font: {
                                sz: 11,
                                bold: true,
                            },
                            alignment: {
                                horizontal: 'right',
                                vertical: 'center',
                                wrapText: true,
                            },
                        };
                    }
                }
            }

            if (hasNetIncome) {
                columnCounter = 1;
                for (let i = 0; i < rowData.length - 1; i++) {
                    let resultFormula;
                    const totalForNetIncomeRow =
                        worksheet1[
                            XLSX.utils.encode_cell({
                                r: rowNum,
                                c: columnCounter,
                            })
                        ];
                    const columnLetter = String.fromCharCode(
                        65 + columnCounter
                    ); // Convert to corresponding ASCII letter
                    if (columnLetter === 'F') {
                        resultFormula = `E${rowNum + 1} / C${rowNum + 1} - 1`;
                        totalForNetIncomeRow.s = {
                            numFmt: '0.0%', // Apply percentage format
                        };
                    } else {
                        resultFormula = `=SUM(${columnLetter}${netOperatingIncomeRowValue}-${columnLetter}${reservTansferRow})`;
                        totalForNetIncomeRow.t = 'n';
                        totalForNetIncomeRow.z =
                            '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
                    }
                    totalForNetIncomeRow.f = resultFormula;
                    columnCounter++;
                }
                continue;
            }
            if (totalForIncome) {
                incomeRow = rowNum + 1;
            }
            const formulaProjected = `(B${rowNum + 1} / ${
                currentMonth - 1
            }) * 12`; // Using column C for 'Budget'
            const formulaChangePercent = `E${rowNum + 1} / C${rowNum + 1} - 1`; // Using column E for '2024Budget and C for Budget'

            if (cellYearBudget && !isTotalRow) {
                cellYearBudget.z = '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
            }

            if (hasNetOperatingIncome) {
                columnCounter = 1;
                let resultFormula;
                for (let i = 0; i < rowData.length - 1; i++) {
                    const totalForNetOperatingRow =
                        worksheet1[
                            XLSX.utils.encode_cell({
                                r: rowNum,
                                c: columnCounter,
                            })
                        ];
                    const columnLetter = String.fromCharCode(
                        65 + columnCounter
                    ); // Convert to corresponding ASCII letter
                    if (columnLetter === 'F') {
                        resultFormula = `E${rowNum + 1} / C${rowNum + 1} - 1`;
                        totalForNetOperatingRow.s = {
                            numFmt: '0.00%', // Apply percentage format
                        };
                    } else {
                        resultFormula = `=SUM(${columnLetter}${incomeRow}-${columnLetter}${expenseRowValue})`;
                        totalForNetOperatingRow.t = 'n';
                        totalForNetOperatingRow.z =
                            '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
                    }
                    totalForNetOperatingRow.f = resultFormula;
                    columnCounter++;
                }
                netOperatingIncomeRowValue = rowNum + 1;
                continue;
            }
            if (cellProjected && !isTotalRow) {
                cellProjected.f = formulaProjected;
                cellProjected.t = 'n';
                cellProjected.z = '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
                cellActual.z = '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
                cellBudget.z = '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string

                count++;
            } else if (isTotalRow || hasNetOperatingIncome) {
                if (totalForExpense) {
                    // Remove the second index (index 1)
                    cellArray.splice(0, 1);
                    for (let i = 0; i < rowData.length - 1; i++) {
                        let formattedArray;
                        const totalForExpenseRow =
                            worksheet1[
                                XLSX.utils.encode_cell({
                                    r: rowNum,
                                    c: columnCounter,
                                })
                            ];
                        const columnLetter = String.fromCharCode(
                            65 + columnCounter
                        ); // Convert to corresponding ASCII letter
                        if (columnLetter === 'F') {
                            formattedArray = `E${rowNum + 1} / C${
                                rowNum + 1
                            } - 1`;
                            totalForExpenseRow.s = {
                                numFmt: '0.00%', // Apply percentage format
                            };
                        } else {
                            formattedArray = cellArray
                                .map((number) => `${columnLetter}${number}`)
                                .join(',');
                            formattedArray = `=SUM(${formattedArray})`;
                            totalForExpenseRow.t = 'n';
                            totalForExpenseRow.z =
                                '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
                        }
                        totalForExpenseRow.f = formattedArray;
                        columnCounter++;
                    }
                    expenseRowValue = rowNum + 1;
                    continue;
                }
                cellArray.push(count);

                const sumFormula = `SUM(D${start}:D${count - 1})`;
                const actualSumFormula = `SUM(B${start}:B${count - 1})`;
                const budgetSumFormula = `SUM(C${start}:C${count - 1})`;
                const yearbudgetSumFormula = `SUM(E${start}:E${count - 1})`;
                if(accountTotal) {
                    accountTotal.s = {
                        font: {
                            sz: 11,
                            bold: true,
                        },
                        alignment: {
                            horizontal: 'left',
                            vertical: 'bottom',
                            wrapText: true,
                        },
                    };
                }
                if(cellProjected) {
                    cellProjected.f = sumFormula;
                    cellProjected.t = 'n';
                    cellProjected.z = '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
                    cellProjected.s = {
                        font: {
                            sz: 11,
                            bold: true,
                        },
                        alignment: {
                            horizontal: 'right',
                            vertical: 'bottom',
                            wrapText: true,
                        },
                    };
                }
                if(cellActual) {
                    cellActual.f = actualSumFormula;
                    cellActual.t = 'n';
                    cellActual.z = '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
                    cellActual.s = {
                        font: {
                            sz: 11,
                            bold: true,
                        },
                        alignment: {
                            horizontal: 'right',
                            vertical: 'bottom',
                            wrapText: true,
                        },
                    };
                }
                if(cellBudget) {
                    cellBudget.f = budgetSumFormula;
                    cellBudget.t = 'n';
                    cellBudget.z = '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
                    cellBudget.s = {
                        font: {
                            sz: 11,
                            bold: true,
                        },
                        alignment: {
                            horizontal: 'right',
                            vertical: 'bottom',
                            wrapText: true,
                        },
                    };
                }
                if(cellYearBudget) {
                    cellYearBudget.f = yearbudgetSumFormula;
                    cellYearBudget.t = 'n';
                    cellYearBudget.z = '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Append "$" to the string
                    cellYearBudget.s = {
                        font: {
                            sz: 11,
                            bold: true,
                        },
                        alignment: {
                            horizontal: 'right',
                            vertical: 'bottom',
                            wrapText: true,
                        },
                    };
                }
                if (rowData[0] === 'Total for Income') {
                    count = count + 3;
                } else {
                    count = count + 2;
                }
                start = count;
            }
            if (cellChangePercent && !isTotalRow) {
                cellChangePercent.f = formulaChangePercent;
                // cellChangePercent.t = 'n';
                cellChangePercent.s = {
                    numFmt: '0.00%', // Apply percentage format
                };
            }
        }

        worksheet1['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: excelHeaders.length - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: excelHeaders.length - 1 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: excelHeaders.length - 1 } },
        ];

        // Set row height
        worksheet1['!rows'] = [{ hpx: 20 }, { hpx: 20 }, { hpx: 20 }];

        // Set row height from third row by looping through data
        worksheet1['!rows'] = worksheet1['!rows'].concat(
            rows.map((row: any) => {
                return { hpx: 20 };
            })
        );

        // Set column width from third column by looping through header
        worksheet1['!cols'] = [
            { wch: 50 }, // Set width of the first column (Account) to 50
            ...excelHeaders.slice(1).map((header: any) => {
                return { wch: 20 };
            }),
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet1, 'Data');

        // Write the workbook to an Excel file
        const buffer1 = XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx',
        });
        // fs.writeFileSync('src/modules/report/report.xlsx', buffer1);
        return buffer1;
    }

    removeZeroTotal(data) {
        const updatedData = {};

        for (const sectionKey in data) {
            if (data.hasOwnProperty(sectionKey)) {
                // Skip filtering for the "Expense" array
                if (sectionKey === 'Expense') {
                    updatedData[sectionKey] = data[sectionKey];
                } else {
                    updatedData[sectionKey] = data[sectionKey].filter(
                        (record) =>
                            record.budgetSum !== 0 || record.actualSum !== 0
                    );
                }
            }
        }

        return updatedData;
    }

    async getReportDetails(queryParams) {
        const report = await this.reportRepository.findOne({
            budgetId: queryParams.budgetId,
            propertyId: queryParams.propertyId,
        });
        if (!report) {
            return {
                msg: 'report not found',
            };
        }
        return report;
    }

    async updateExistingReport() {
        try {
            const reports = await this.reportRepository.findAll({});

            for (const report of reports) {
                const params = {
                    startdate: report.startdate,
                    enddate: report.enddate,
                    budgetId: report.budgetId,
                    propertyId: report.propertyId,
                    selectionentitytype: 'Association',
                };
                const updatedREportData = await this.generateReport(params);
                if (updatedREportData) {
                    const updated = await this.reportRepository.updateOne(
                        params,
                        { data: updatedREportData }
                    );
                }
            }
        } catch (error) {
            return error;
        }
    }

    async getBudgetYear(budgetId) {
        const budget = await this.budgetsRepository.findOne({ id: budgetId });
        const yearMatch = budget.name.match(/(\d{4})\sBudget/);// Match a sequence of four digits starting with 2
        return yearMatch ? parseInt(yearMatch[0]) : null;
    }

    async saveUpdatedReport(body) {
        try {
            const where: ReportDto = {
                startdate: body.startDate,
                enddate: body.endDate,
                budgetId: body.budgetId,
                propertyId: body.propertyId,
                selectionentitytype: body.selectionentitytype,
            };
            let report;

            // Check if name is provided in the body
            if (body.name) {
                where.name = body.name;
                report = await this.reportRepository.findOne({ ...where });
            } else {
                // If name is not provided, check for matching parameters
                report = await this.reportRepository.findOne({
                    ...where,
                    name: { $exists: false },
                });
            }

            if (report) {
                await this.reportRepository.updateOne(
                    { _id: report._id },
                    {
                        data: body.gridData,
                    }
                );
            } else {
                return await this.reportRepository.create({
                    ...where,
                    data: body.gridData,
                });
            }
        } catch (error) {
            throw error;
        }
    }
}