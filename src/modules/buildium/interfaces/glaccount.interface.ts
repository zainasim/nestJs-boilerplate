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
import { glAaccountDto } from 'src/modules/buildium/dtos/glaccount.create.dto';

// import { IAssociationEntity } from 'src/modules/buildium/interfaces/association.interface';
import { glaccountsEntity } from 'src/modules/buildium/repository/entities/glaccounts.entity';
import { AssociationGetSerialization } from 'src/modules/buildium/serializations/association.get.serialization';


export interface IglAccountInterface {
    findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]>;

    findOneById<T>(_id: string, options?: IDatabaseFindOneOptions): Promise<T>;

    findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T>;


    // create(
    //     data: glAaccountDto,
    //     options?: IDatabaseCreateOptions
    // ): Promise<glaccountsEntity>;


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
