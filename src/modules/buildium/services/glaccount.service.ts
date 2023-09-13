import { Injectable } from '@nestjs/common';
import {
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseManyOptions,
} from 'src/common/database/interfaces/database.interface';
import { glaccountsEntity } from 'src/modules/buildium/repository/entities/glaccounts.entity';

import { glAccountRepository } from 'src/modules/buildium/repository/repositories/glaccounts.repository';

import { IglAccountInterface } from 'src/modules/buildium/interfaces/glaccount.interface';
import { AssociationGetSerialization } from 'src/modules/buildium/serializations/association.get.serialization';
import { plainToInstance } from 'class-transformer';
import { AxiosRequestConfig } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { HttpService } from '@nestjs/axios';
import { glAccountUrl } from 'src/modules/buildium/constants/buildium.constants';
import { reservesRepository } from '../repository/repositories/reserves.repository';

@Injectable()
export class glAccountService implements IglAccountInterface {
    constructor(
        private readonly glAccounyRepository: glAccountRepository,
        private readonly ReservesRepository: reservesRepository,
        private readonly http: HttpService
    ) {}

    async findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]> {
        console.log(find);
        return this.glAccounyRepository.findglAccount<T>(find, options);
    }

    async findOneById<T>(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.glAccounyRepository.findOneById<T>(_id, options);
    }

    async findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.glAccounyRepository.findOne<T>(find, options);
    }

    async findOneByUsername<T>(
        username: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.glAccounyRepository.findOne<T>({ username }, options);
    }

    async payloadSerialization(
        data: IglAccountInterface
    ): Promise<AssociationGetSerialization> {
        return plainToInstance(AssociationGetSerialization, data);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseManyOptions
    ): Promise<boolean> {
        return this.glAccounyRepository.deleteMany(find, options);
    }

    async fetchGlAccounts() {
        try {
            await this.glAccounyRepository.deleteMany({});
            const glAccountConfig = this.defineConfig(glAccountUrl);
            const glAccoubtsResponse: any = await this.http.axiosRef.request(
                glAccountConfig
            );
            const glAccounts = glAccoubtsResponse.data;
            return this.glAccounyRepository.createMany(glAccounts);
        } catch (error) {
            return error;
        }
    }

 
    async fetchAndCreateReserves() {
        try {
            await this.ReservesRepository.deleteMany({});
            let reserves = await this.glAccounyRepository.findglAccount(
                { Type: 'Asset' },
                {}
            );
            const filteredData = reserves.filter((obj) =>
                obj.Name.startsWith('x Reserve')
            );

            const result = filteredData.map((obj) => {
                return {
                    Name: obj.Name,
                    Id: obj.Id,
                    Type: obj.Type,
                };
            });

            return await this.ReservesRepository.createMany(result);

            // return  this.glAccounyRepository.createMany(glAccounts)
        } catch (error) {
            return error;
        }
    }

    defineConfig(
        url: string,
        params?: object,
        method = 'GET',
        customHeaders?: object
    ): AxiosRequestConfig {
        const defaultParams = {
            limit: 1000,
        };

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
