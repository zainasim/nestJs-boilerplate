import { Injectable } from '@nestjs/common';
import { IUserService } from 'src/modules/user/interfaces/user.service.interface';
import {
    IDatabaseCreateOptions,
    IDatabaseSoftDeleteOptions,
    IDatabaseExistOptions,
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseOptions,
    IDatabaseManyOptions,
} from 'src/common/database/interfaces/database.interface';
import { UserPhotoDto } from 'src/modules/user/dtos/user.photo.dto';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';
import { UserRepository } from 'src/modules/user/repository/repositories/user.repository';
import { UserPasswordDto } from 'src/modules/user/dtos/user.password.dto';
import { UserActiveDto } from 'src/modules/user/dtos/user.active.dto';
import { UserPasswordAttemptDto } from 'src/modules/user/dtos/user.password-attempt.dto';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { ConfigService } from '@nestjs/config';
import { HelperStringService } from 'src/common/helper/services/helper.string.service';
import { UserCreateDto } from 'src/modules/user/dtos/user.create.dto';
import { IAuthPassword } from 'src/common/auth/interfaces/auth.interface';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { UserUpdateDto } from 'src/modules/user/dtos/user.update-name.dto';
import { IUserEntity } from 'src/modules/user/interfaces/user.interface';
import { UserPayloadSerialization } from 'src/modules/user/serializations/user.payload.serialization';
import { plainToInstance } from 'class-transformer';
import { PermissionEntity } from 'src/modules/permission/repository/entities/permission.entity';
import { UserPayloadPermissionSerialization } from 'src/modules/user/serializations/user.payload-permission.serialization';
import { UserBlockedDto } from 'src/modules/user/dtos/user.block.dto';
import { UserPasswordExpiredDto } from 'src/modules/user/dtos/user.password-expired.dto';
import { UpdateUserDto } from '../dtos/user.updtae.dto';

@Injectable()
export class UserService implements IUserService {
    private readonly uploadPath: string;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly helperDateService: HelperDateService,
        private readonly helperStringService: HelperStringService,
        private readonly configService: ConfigService
    ) {
        this.uploadPath = this.configService.get<string>('user.uploadPath');
    }

    async findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]> {
        return this.userRepository.findAll<T>(find, options);
    }

    async findOneById<T>(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.userRepository.findOneById<T>(_id, options);
    }

    async findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.userRepository.findOne<T>(find, options);
    }

    async findOneByUsername<T>(
        username: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.userRepository.findOne<T>({ username }, options);
    }

    async findOneByEmail<T>(
        email: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.userRepository.findOne<T>({ email }, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number> {
        return this.userRepository.getTotal(find, options);
    }

    async create(
        {
            username,
            firstName,
            lastName,
            email,
            
            role,
        }: UserCreateDto,
        { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
        options?: IDatabaseCreateOptions
    ): Promise<UserEntity> {
        const create: UserEntity = new UserEntity();
        // create.username = username;
        create.firstName = firstName;
        create.email = email;
        create.password = passwordHash;
        create.role = role;
        create.isActive = true;
        create.inactivePermanent = false;
        create.blocked = false;
        create.lastName = lastName;
        create.salt = salt;
        create.passwordExpired = passwordExpired;
        create.passwordCreated = passwordCreated;
        create.signUpDate = this.helperDateService.create();
        create.passwordAttempt = 0;
        // create.mobileNumber = mobileNumber ?? undefined;

        return this.userRepository.create<UserEntity>(create, options);
    }

    async deleteOneById(
        _id: string,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<UserEntity> {
        return this.userRepository.softDeleteOneById(_id, options);
    }

    async deleteOne(
        find: Record<string, any>,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<UserEntity> {
        return this.userRepository.softDeleteOne(find, options);
    }

    async updateName(
        _id: string,
        data: UpdateUserDto,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UpdateUserDto>(
            _id,
            data,
            options
        );
    }

    async updatePhoto(
        _id: string,
        photo: AwsS3Serialization,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserPhotoDto>(
            _id,
            {
                photo: photo,
            },
            options
        );
    }

    async existByEmail(
        email: string,
        options?: IDatabaseExistOptions
    ): Promise<boolean> {
        return this.userRepository.exists(
            {
                email: {
                    $regex: new RegExp(email),
                    $options: 'i',
                },
            },
            { ...options, withDeleted: true }
        );
    }

    // async existByMobileNumber(
    //     mobileNumber: string,
    //     options?: IDatabaseExistOptions
    // ): Promise<boolean> {
    //     return this.userRepository.exists(
    //         {
    //             mobileNumber,
    //         },
    //         { ...options, withDeleted: true }
    //     );
    // }

    // async existByUsername(
    //     username: string,
    //     options?: IDatabaseExistOptions
    // ): Promise<boolean> {
    //     return this.userRepository.exists(
    //         { username },
    //         { ...options, withDeleted: true }
    //     );
    // }

    async updatePassword(
        _id: string,
        { passwordHash, passwordExpired, salt, passwordCreated }: IAuthPassword,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserPasswordDto>(
            _id,
            {
                password: passwordHash,
                passwordExpired,
                passwordCreated,
                salt,
            },
            options
        );
    }

    async active(_id: string, options?: IDatabaseOptions): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserActiveDto>(
            _id,
            {
                isActive: true,
                inactiveDate: undefined,
            },
            options
        );
    }

    async inactive(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserActiveDto>(
            _id,
            {
                isActive: false,
                inactiveDate: this.helperDateService.create(),
            },
            options
        );
    }

    async blocked(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserBlockedDto>(
            _id,
            {
                blocked: true,
                blockedDate: this.helperDateService.create(),
            },
            options
        );
    }

    async unblocked(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserBlockedDto>(
            _id,
            {
                blocked: false,
                blockedDate: undefined,
            },
            options
        );
    }

    async maxPasswordAttempt(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserPasswordAttemptDto>(
            _id,
            {
                passwordAttempt: 3,
            },
            options
        );
    }

    async increasePasswordAttempt(
        user: UserEntity | IUserEntity,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserPasswordAttemptDto>(
            user._id,
            {
                passwordAttempt: ++user.passwordAttempt,
            },
            options
        );
    }

    async resetPasswordAttempt(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserPasswordAttemptDto>(
            _id,
            {
                passwordAttempt: 0,
            },
            options
        );
    }

    async createPhotoFilename(): Promise<Record<string, any>> {
        const filename: string = this.helperStringService.random(20);

        return {
            path: this.uploadPath,
            filename: filename,
        };
    }

    async payloadSerialization(
        data: IUserEntity
    ): Promise<UserPayloadSerialization> {
        return plainToInstance(UserPayloadSerialization, data);
    }

    async payloadPermissionSerialization(
        _id: string,
        permissions: PermissionEntity[]
    ): Promise<UserPayloadPermissionSerialization> {
        return plainToInstance(UserPayloadPermissionSerialization, {
            _id,
            permissions,
        });
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseManyOptions
    ): Promise<boolean> {
        return this.userRepository.deleteMany(find, options);
    }

    async updatePasswordExpired(
        _id: string,
        passwordExpired: Date,
        options?: IDatabaseOptions
    ): Promise<UserEntity> {
        return this.userRepository.updateOneById<UserPasswordExpiredDto>(
            _id,
            {
                passwordExpired,
            },
            options
        );
    }
}
