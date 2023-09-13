import { IAuthPassword } from 'src/common/auth/interfaces/auth.interface';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import {
    IDatabaseCreateOptions,
    IDatabaseSoftDeleteOptions,
    IDatabaseExistOptions,
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseOptions,
    IDatabaseManyOptions,
} from 'src/common/database/interfaces/database.interface';
import { PermissionEntity } from 'src/modules/permission/repository/entities/permission.entity';
import { PropertyDto } from 'src/modules/buildium/dtos/associations.create.dto';

// import { IAssociationEntity } from 'src/modules/buildium/interfaces/association.interface';
import { AssociationEntity } from 'src/modules/buildium/repository/entities/assocations.entity';
import { AssociationGetSerialization } from 'src/modules/buildium/serializations/association.get.serialization';


export interface IAssociationService {
    findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]>;

    findOneById<T>(_id: string, options?: IDatabaseFindOneOptions): Promise<T>;

    findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T>;


    create(
        data: PropertyDto,
        options?: IDatabaseCreateOptions
    ): Promise<AssociationEntity>;


    // payloadSerialization(data: IAssociationEntity): Promise<UserPayloadSerialization>;

    // payloadPermissionSerialization(
    //     _id: string,
    //     permissions: PermissionEntity[]
    // ): Promise<associationResponseSerialization>;

    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseManyOptions
    ): Promise<boolean>;

}
