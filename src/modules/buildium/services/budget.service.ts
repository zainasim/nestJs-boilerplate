import { Injectable } from '@nestjs/common';
import {
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseManyOptions,
} from 'src/common/database/interfaces/database.interface';
import { glaccountsEntity } from 'src/modules/buildium/repository/entities/glaccounts.entity';

import { budgetsRepository } from 'src/modules/buildium/repository/repositories/budget.repositories';

import { IBudgetInterface } from 'src/modules/buildium/interfaces/budget.interface';
import { BudgetListSerialization } from 'src/modules/buildium/serializations/budget.get.serialization';
import { plainToInstance } from 'class-transformer';
import { AxiosRequestConfig } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { HttpService } from '@nestjs/axios';
import { budgetsUrl } from 'src/modules/buildium/constants/buildium.constants';

@Injectable()
export class budgetService implements IBudgetInterface {
    constructor(
        private readonly budgetRepository: budgetsRepository,
        private readonly http: HttpService
    ) {}

    async findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]> {
        console.log(find);
        return this.budgetRepository.findAll<T>(find, options);
    }

    async findOneById<T>(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.budgetRepository.findOneById<T>(_id, options);
    }

    async findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.budgetRepository.findOne<T>(find, options);
    }

    async findOneByUsername<T>(
        username: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.budgetRepository.findOne<T>({ username }, options);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseManyOptions
    ): Promise<boolean> {
        return this.budgetRepository.deleteMany(find, options);
    }

    async fetchBudgets() {
        const idArray = [
            15191, 15192, 15194, 15355, 15357, 15358, 15359, 15361, 15362, 23976, 29831, 29835, 29839, 29842, 29846, 31724, 43591, 54056, 55547, 56418, 60226, 61217, 62093, 72639, 73482, 75329, 75552, 79479, 84243, 84244, 84246, 84258, 85223, 86116, 86496, 86865, 86866, 87127, 87857, 88865, 88866, 89426, 90955, 91117, 91225, 93386, 93390, 93391, 93392, 93401, 93402, 95089, 97110, 97222, 98455, 98837, 99063, 99195, 99327, 99794, 99811, 99914, 99931, 100184, 100363, 100409, 100414, 100556, 100719, 100797, 100818, 100960, 101298, 101313, 101337, 101338, 101423, 101466, 101496, 101522, 101565, 101603, 101652, 101653, 101665, 101666, 101850, 101884, 101900, 101966, 101987, 102021, 102036, 102037, 102041, 102126, 102132, 102260, 102273, 102274, 102299, 102363, 102376, 102416, 102443, 102444, 102616, 102713, 102728, 102826, 103009, 103013, 103050, 103051, 103061, 103125, 103150, 103152, 103165, 103178, 103183, 103237, 103258
        ];
        let i = 0;
    
        try {
            await this.budgetRepository.deleteMany({});
    
            for (const id of idArray) {
                const budgetsUrlWithId = `${budgetsUrl}?propertyids=${id}`;
                const budgetConfig = this.defineConfig(budgetsUrlWithId);
                
                try {
                    const budgetsResponse = await this.http.axiosRef.request(budgetConfig);
                    const budgetsData = budgetsResponse.data;
    
                    if (budgetsData.length > 0) {
                        const extractedData = budgetsData.map((item) => ({
                            id: item.Id,
                            name: item.Name,
                            propertyId: item.Property.Id,
                            StartDate: item.StartDate,
                        }));
    
                        await this.budgetRepository.createMany(extractedData);
                        i++;
                    }
                } catch (error) {
                    console.error(`Error fetching or processing data for ID ${id}:`, error);
                }
            }
        } catch (error) {
            console.error("Error deleting existing data:", error);
        }
    }

    defineConfig(
        url: string,
        params?: object,
        method = 'GET',
        customHeaders?: object
    ): AxiosRequestConfig {
        const defaultParams = {};

        const defaultHeaders = {
            'x-buildium-client-id': '1aba69ce-2f02-400f-bec0-f97b92717903',
            'x-buildium-client-secret':
                'ZTJ/6h7UCC4Wjpu6KCiebEuXyMhjNzRZfYBIpwnz8jU=',
        };

        const config: AxiosRequestConfig = {
            url,
            params: { ...defaultParams, ...params },
            method,
            headers: { ...defaultHeaders, ...customHeaders },
        };
        return config;
    }
}
