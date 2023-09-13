import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionRepository } from '../repository/repositories/transaction.repository';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import {
    expenseIds,
    generalLedgerTransactionsUrl,
    incomeIds,
    propertyIds,
} from '../constants/buildium.constants';

@Injectable()
export class TransactionService {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private httpService: HttpService
    ) {}

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

    async findAll(propertyId) {
        return this.transactionRepository.findAll({PropertyId: propertyId});
    }

    async fetchAndCreatetransactions() {
        try {
            const startDate = '2023-01-01';
            const endDate = '2023-07-20';
            // const propertyId = 15191;
            for (const propertyId of propertyIds) {
                const baseGeneralLedgerURL = `${generalLedgerTransactionsUrl}0&startdate=${startDate}&enddate=${endDate}&selectionentityid=${propertyId}&glaccountids=${incomeIds}`;
                const GeneralLedgerConfig =
                    this.defineConfig(baseGeneralLedgerURL);
                const GeneralLedgerResponse =
                    await this.httpService.axiosRef.request(
                        GeneralLedgerConfig
                    );

                let mergedArray = GeneralLedgerResponse.data;
                for (let obj of mergedArray) {
                    obj.PropertyId = propertyId;
                }
                console.log('typeeee', mergedArray[0]);
                const transaction1 =
                    await this.transactionRepository.createMany(mergedArray);
                console.log('before loop', transaction1);
                for (
                    let offset = 999;
                    GeneralLedgerResponse.data.length > 0;
                    offset += 1000
                ) {
                    const baseGeneralLedgerURL = `${generalLedgerTransactionsUrl}${offset}&startdate=${startDate}&enddate=${endDate}&selectionentityid=${propertyId}&glaccountids=${incomeIds}`;
                    const GeneralLedgerConfig =
                        this.defineConfig(baseGeneralLedgerURL);

                    const GeneralLedgerResponse =
                        await this.httpService.axiosRef.request(
                            GeneralLedgerConfig
                        );

                    if (GeneralLedgerResponse.data.length > 0) {
                        const data = GeneralLedgerResponse.data;
                        for (let obj of data) {
                            obj.PropertyId = propertyId;
                        }
                        const transaction =
                            await this.transactionRepository.createMany(data);
                        console.log('transss', data[0]);

                        mergedArray = [
                            ...mergedArray,
                            ...GeneralLedgerResponse.data,
                        ];
                    } else {
                        break;
                    }
                }
                // for expense
                const baseGeneralLedgerURLExpense = `${generalLedgerTransactionsUrl}0&startdate=${startDate}&enddate=${endDate}&selectionentityid=${propertyId}&glaccountids=${expenseIds}`;
                const GeneralLedgerConfigExpense = this.defineConfig(
                    baseGeneralLedgerURLExpense
                );
                const GeneralLedgerResponseExpense =
                    await this.httpService.axiosRef.request(
                        GeneralLedgerConfigExpense
                    );

                let mergedArray1 = GeneralLedgerResponseExpense.data;
                for (let obj of mergedArray1) {
                    obj.PropertyId = propertyId;
                }
                console.log('typeeee', mergedArray1[0]);
                const transaction2 =
                    await this.transactionRepository.createMany(mergedArray1);
                console.log('before loop', transaction2);
                for (
                    let offset = 999;
                    GeneralLedgerResponseExpense.data.length > 0;
                    offset += 1000
                ) {
                    const baseGeneralLedgerURLExpense = `${generalLedgerTransactionsUrl}${offset}&startdate=${startDate}&enddate=${endDate}&selectionentityid=${propertyId}&glaccountids=${expenseIds}`;
                    const GeneralLedgerConfigExpense = this.defineConfig(
                        baseGeneralLedgerURLExpense
                    );

                    const GeneralLedgerResponseExpense =
                        await this.httpService.axiosRef.request(
                            GeneralLedgerConfigExpense
                        );

                    if (GeneralLedgerResponseExpense.data.length > 0) {
                        const data = GeneralLedgerResponseExpense.data;
                        for (let obj of data) {
                            obj.PropertyId = propertyId;
                        }
                        const transaction =
                            await this.transactionRepository.createMany(data);
                        console.log('transss', data[0]);

                        mergedArray1 = [
                            ...mergedArray1,
                            ...GeneralLedgerResponseExpense.data,
                        ];
                    } else {
                        break;
                    }
                }
            }
            return 'Transactions data is saved';
        } catch (error) {
            console.log('error', error, error.message);
            throw new BadRequestException(error);
        }
    }
}
