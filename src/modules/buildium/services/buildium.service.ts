import { Injectable } from '@nestjs/common';
import { IAssociationService } from 'src/modules/buildium/interfaces/buildium.service.interface';
import {
    IDatabaseCreateOptions,
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseManyOptions,
} from 'src/common/database/interfaces/database.interface';
import { AssociationEntity } from 'src/modules/buildium/repository/entities/assocations.entity';

import { AssociationRepository } from 'src/modules/buildium/repository/repositories/association.repository';

import { PropertyDto } from 'src/modules/buildium/dtos/associations.create.dto';

import { IAssociationInterface } from 'src/modules/buildium/interfaces/association.interface';
import { AssociationGetSerialization } from 'src/modules/buildium/serializations/association.get.serialization';
import { plainToInstance } from 'class-transformer';
import { AxiosRequestConfig } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { HttpService } from '@nestjs/axios';
import {
    associationUrl,
    glAccountUrl,
} from 'src/modules/buildium/constants/buildium.constants';
import { reservesRepository } from '../repository/repositories/reserves.repository';
import { glAccountService } from './glaccount.service';

@Injectable()
export class AssociationService implements IAssociationService {
    constructor(
        private readonly associationRepository: AssociationRepository,
        private readonly reserveRepository: reservesRepository,

        private readonly http: HttpService
    ) {}

    async findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]> {
        return this.associationRepository.findAll<T>(find, options);
    }

    async findOneById<T>(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.associationRepository.findOneById<T>(_id, options);
    }

    async findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.associationRepository.findOne<T>(find, options);
    }

    async findReserve<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]> {
        return this.reserveRepository.findAll<T>(find, options);
    }

    async findOneByUsername<T>(
        username: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.associationRepository.findOne<T>({ username }, options);
    }

    async create(
        { propertyName, id, location, propertyManager }: PropertyDto,
        options?: IDatabaseCreateOptions
    ): Promise<AssociationEntity> {
        const create: AssociationEntity = new AssociationEntity();
        create.id = id;
        create.propertyManager = propertyManager;
        create.propertyName = propertyName;
        create.location = location;
        return this.associationRepository.create<AssociationEntity>(
            create,
            options
        );
    }

    async payloadSerialization(
        data: IAssociationInterface
    ): Promise<AssociationGetSerialization> {
        return plainToInstance(AssociationGetSerialization, data);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseManyOptions
    ): Promise<boolean> {
        return this.associationRepository.deleteMany(find, options);
    }

    async fetchAssiations() {
        await this.associationRepository.deleteMany({});
        const associationConfig = this.defineConfig(associationUrl);
        const associationResponse: any = await this.http.axiosRef.request(
            associationConfig
        );
        let associations = associationResponse.data;

        const transformedArray = associations.map((item) => {
            const { Id, Name, Address, AssociationManager } = item;
            const propertyName = Name;
            const location = Address ? Address.City : null;
            const propertyManager =
                AssociationManager &&
                AssociationManager.FirstName &&
                AssociationManager.LastName
                    ? `${AssociationManager.FirstName} ${AssociationManager.LastName}`
                    : null;

            return {
                id: Id,
                propertyName,
                location,
                propertyManager,
            };
        });

        return this.associationRepository.createMany(transformedArray);
    }

    async fetchGlAccounts() {
        const glAccountConfig = this.defineConfig(glAccountUrl);
        const glAccoubtsResponse: any = await this.http.axiosRef.request(
            glAccountConfig
        );
        let glAccounts = glAccoubtsResponse.data;
        return this.associationRepository.createMany(glAccounts);
    }

    async createReserves() {
        const glAccountConfig = this.defineConfig(glAccountUrl);
        const glAccoubtsResponse: any = await this.http.axiosRef.request(
            glAccountConfig
        );
        let glAccounts = glAccoubtsResponse.data;
        return this.associationRepository.createMany(glAccounts);
    }

    defineConfig(
        url: string,
        params?: object,
        method: string = 'GET',
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
