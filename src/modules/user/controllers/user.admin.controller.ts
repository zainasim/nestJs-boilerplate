import {
    Controller,
    Get,
    Post,
    Body,
    Delete,
    Put,
    InternalServerErrorException,
    NotFoundException,
    UploadedFile,
    ConflictException,
    Patch,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENUM_AUTH_PERMISSIONS } from 'src/common/auth/constants/auth.enum.permission.constant';
import { AuthService } from 'src/common/auth/services/auth.service';
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant';
import { UploadFileSingle } from 'src/common/file/decorators/file.decorator';
import { IFileExtract } from 'src/common/file/interfaces/file.interface';
import { FileExtractPipe } from 'src/common/file/pipes/file.extract.pipe';
import { FileRequiredPipe } from 'src/common/file/pipes/file.required.pipe';
import { FileSizeExcelPipe } from 'src/common/file/pipes/file.size.pipe';
import { FileTypeExcelPipe } from 'src/common/file/pipes/file.type.pipe';
import { FileValidationPipe } from 'src/common/file/pipes/file.validation.pipe';
import { ENUM_HELPER_FILE_TYPE } from 'src/common/helper/constants/helper.enum.constant';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { RequestParamGuard } from 'src/common/request/decorators/request.decorator';
import {
    Response,
    ResponseExcel,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import {
    IResponse,
    IResponsePaging,
} from 'src/common/response/interfaces/response.interface';
import { ResponseIdSerialization } from 'src/common/response/serializations/response.id.serialization';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/constants/role.status-code.constant';
import { RoleService } from 'src/modules/role/services/role.service';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/constants/user.status-code.constant';
import {
    UserDeleteGuard,
    UserGetGuard,
    UserUpdateActiveGuard,
    UserUpdateBlockedGuard,
    UserUpdateGuard,
    UserUpdateInactiveGuard,
} from 'src/modules/user/decorators/user.admin.decorator';
import { GetUser } from 'src/modules/user/decorators/user.decorator';
import {
    UserActiveDoc,
    UserBlockedDoc,
    UserCreateDoc,
    UserDeleteDoc,
    UserExportDoc,
    UserGetDoc,
    UserImportDoc,
    UserInactiveDoc,
    UserListDoc,
    UserUpdateDoc,
} from 'src/modules/user/docs/user.admin.doc';
import { UserCreateDto } from 'src/modules/user/dtos/user.create.dto';
import { UserImportDto } from 'src/modules/user/dtos/user.import.dto';
import { UserRequestDto } from 'src/modules/user/dtos/user.request.dto';
import { IUserEntity } from 'src/modules/user/interfaces/user.interface';
import { UserGetSerialization } from 'src/modules/user/serializations/user.get.serialization';
import { UserImportSerialization } from 'src/modules/user/serializations/user.import.serialization';
import { UserListSerialization } from 'src/modules/user/serializations/user.list.serialization';
import { UserService } from 'src/modules/user/services/user.service';
import {
    AuthJwtAdminAccessProtected,
    AuthJwtPayload,
} from 'src/common/auth/decorators/auth.jwt.decorator';
import { AuthPermissionProtected } from 'src/common/auth/decorators/auth.permission.decorator';
import { UserUpdateDto } from 'src/modules/user/dtos/user.update-name.dto';
import { UserPasswordUpdateDto } from 'src/modules/user/dtos/user.update.password.dto';

import {
    USER_DEFAULT_AVAILABLE_SEARCH,
    USER_DEFAULT_AVAILABLE_SORT,
    USER_DEFAULT_BLOCKED,
    USER_DEFAULT_IS_ACTIVE,
    USER_DEFAULT_PER_PAGE,
    USER_DEFAULT_SORT,
} from 'src/modules/user/constants/user.list.constant';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import {
    PaginationQuery,
    PaginationQueryFilterInBoolean,
} from 'src/common/pagination/decorators/pagination.decorator';
import { UserChangePasswordDto } from '../dtos/user.change-password.dto';
import { UserEntity } from '../repository/entities/user.entity';
import { UpdateUserDto } from '../dtos/user.updtae.dto';

@ApiTags('modules.admin.user')
@Controller({
    version: '1',
    path: '/user',
})
export class UserAdminController {
    constructor(
        private readonly authService: AuthService,
        private readonly paginationService: PaginationService,
        private readonly userService: UserService,
        private readonly roleService: RoleService
    ) {}

    @UserListDoc()
    @ResponsePaging('user.list', {
        serialization: UserListSerialization,
    })
    @AuthPermissionProtected(ENUM_AUTH_PERMISSIONS.USER_READ)
    @AuthJwtAdminAccessProtected()
    @Get('/list')
    async list(
        @PaginationQuery(
            USER_DEFAULT_PER_PAGE,
            USER_DEFAULT_AVAILABLE_SEARCH,
            USER_DEFAULT_SORT,
            USER_DEFAULT_AVAILABLE_SORT
        )
        {
            page,
            perPage,
            _sort,
            _search,
            _offset,
            _availableSort,
            _availableSearch,
        }: PaginationListDto,
        @PaginationQueryFilterInBoolean('isActive', USER_DEFAULT_IS_ACTIVE)
        isActive: Record<string, any>,
        @PaginationQueryFilterInBoolean('blocked', USER_DEFAULT_BLOCKED)
        blocked: Record<string, any>
    ): Promise<IResponsePaging> {
        const find: Record<string, any> = {
            ..._search,
            ...isActive,
            ...blocked,
        };

        const users: IUserEntity[] = await this.userService.findAll(find, {
            paging: {
                limit: perPage,
                offset: _offset,
            },
            join: true,
            sort: _sort,
        });
        const filteredData = users.filter((item) => item.email !== 'superadmin@mail.com');

        const totalData: number = await this.userService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            totalData,
            perPage
        );

        return {
            totalData,
            totalPage,
            currentPage: page,
            perPage,
            _availableSearch,
            _availableSort,
            data: filteredData,
        };
    }

    @UserGetDoc()
    @Response('user.get', {
        serialization: UserGetSerialization,
    })
    @UserGetGuard()
    @RequestParamGuard(UserRequestDto)
    @AuthPermissionProtected(ENUM_AUTH_PERMISSIONS.USER_READ)
    @AuthJwtAdminAccessProtected()
    @Get('get/:user')
    async get(@GetUser() user: IUserEntity): Promise<IResponse> {
        console.log('***************');
        console.log(user);

        return user;
    }

    @UserGetDoc()
    @Response('user.get', {
        serialization: UserGetSerialization,
    })
    @UserGetGuard()
    @RequestParamGuard(UserRequestDto)
    @AuthPermissionProtected(ENUM_AUTH_PERMISSIONS.USER_READ)
    @AuthJwtAdminAccessProtected()
    @Get('get/:user')
    async getUserById(@GetUser() user: IUserEntity): Promise<IResponse> {
        console.log('***************');
        console.log(user);

        return user;
    }

    @UserCreateDoc()
    @Response('user.create', {
        serialization: ResponseIdSerialization,
    })
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.USER_READ,
        ENUM_AUTH_PERMISSIONS.USER_CREATE
    )
    @AuthJwtAdminAccessProtected()
    @Post('/create')
    async create(
        @Body()
        { email, role, ...body }: UserCreateDto
    ): Promise<IResponse> {
        const checkRole = await this.roleService.findOneById(role);
        console.log(body, 'roleeeeeeeeeee');
        if (!checkRole) {
            throw new NotFoundException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
                message: 'role.error.notFound',
            });
        }

        // const usernameExist: boolean = await this.userService.existByUsername(
        //     username
        // );
        // if (usernameExist) {
        //     throw new ConflictException({
        //         statusCode:
        //             ENUM_USER_STATUS_CODE_ERROR.USER_USERNAME_EXISTS_ERROR,
        //         message: 'user.error.usernameExist',
        //     });
        // }

        const emailExist: boolean = await this.userService.existByEmail(email);
        if (emailExist) {
            throw new ConflictException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR,
                message: 'user.error.emailExist',
            });
        }

        // if (mobileNumber) {
        //     const mobileNumberExist: boolean =
        //         await this.userService.existByMobileNumber(mobileNumber);
        //     if (mobileNumberExist) {
        //         throw new ConflictException({
        //             statusCode:
        //                 ENUM_USER_STATUS_CODE_ERROR.USER_MOBILE_NUMBER_EXIST_ERROR,
        //             message: 'user.error.mobileNumberExist',
        //         });
        //     }
        // }

        try {
            const password = await this.authService.createPassword(
                body.password
            );

            const create = await this.userService.create(
                { email, role, ...body },
                password
            );

            return {
                _id: create._id,
            };
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    @UserDeleteDoc()
    @Response('user.delete')
    @UserDeleteGuard()
    @RequestParamGuard(UserRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.USER_READ,
        ENUM_AUTH_PERMISSIONS.USER_DELETE
    )
    @AuthJwtAdminAccessProtected()
    @Delete('/delete/:user')
    async delete(@GetUser() user: IUserEntity): Promise<void> {
        try {
            await this.userService.deleteOneById(user._id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }

    @UserUpdateDoc()
    @Response('user.update', {
        serialization: ResponseIdSerialization,
    })
    @UserUpdateGuard()
    @RequestParamGuard(UserRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.USER_READ,
        ENUM_AUTH_PERMISSIONS.USER_UPDATE
    )
    @AuthJwtAdminAccessProtected()
    @Put('/update/:user')
    async update(
        @GetUser() user: IUserEntity,
        @Body()
        body: UpdateUserDto
    ): Promise<IResponse> {
        try {
           if(body.password) {
            const newPassword = await this.authService.createPassword(
                body.password
            );
            console.log("--------", newPassword);
            
            body.password = newPassword.passwordHash
           }
            await this.userService.updateName(user._id, body);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return {
            _id: user._id,
        };
    }

    @UserUpdateGuard()
    @Response('user.update', {
        serialization: ResponseIdSerialization,
    })
    @RequestParamGuard(UserRequestDto)
    @AuthJwtAdminAccessProtected()
    @Patch('/change-password')
    async changePassword(@Body() body: UserPasswordUpdateDto): Promise<any> {
        const user: UserEntity = await this.userService.findOneById(body._id);

        if (!user) {
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
                message: 'user.error.notFound',
            });
        }

        try {
            const password = await this.authService.createPassword(
                body.newPassword
            );
            return await this.userService.updatePassword(user._id, password);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    @UserInactiveDoc()
    @Response('user.inactive')
    @UserUpdateInactiveGuard()
    @RequestParamGuard(UserRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.USER_READ,
        ENUM_AUTH_PERMISSIONS.USER_UPDATE,
        ENUM_AUTH_PERMISSIONS.USER_INACTIVE
    )
    @AuthJwtAdminAccessProtected()
    @Patch('/update/:user/inactive')
    async inactive(@GetUser() user: IUserEntity): Promise<void> {
        try {
            await this.userService.inactive(user._id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }

    @UserActiveDoc()
    @Response('user.active')
    @UserUpdateActiveGuard()
    @RequestParamGuard(UserRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.USER_READ,
        ENUM_AUTH_PERMISSIONS.USER_UPDATE,
        ENUM_AUTH_PERMISSIONS.USER_ACTIVE
    )
    @AuthJwtAdminAccessProtected()
    @Patch('/update/:user/active')
    async active(@GetUser() user: IUserEntity): Promise<void> {
        try {
            await this.userService.active(user._id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }

    @UserImportDoc()
    @Response('user.import', {
        serialization: UserImportSerialization,
    })
    @UploadFileSingle('file')
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.USER_READ,
        ENUM_AUTH_PERMISSIONS.USER_CREATE,
        ENUM_AUTH_PERMISSIONS.USER_IMPORT
    )
    @AuthJwtAdminAccessProtected()
    @Post('/import')
    async import(
        @UploadedFile(
            FileRequiredPipe,
            FileSizeExcelPipe,
            FileTypeExcelPipe,
            FileExtractPipe,
            new FileValidationPipe<UserImportDto>(UserImportDto)
        )
        file: IFileExtract<UserImportDto>
    ): Promise<IResponse> {
        return { file };
    }

    @UserExportDoc()
    @ResponseExcel({
        serialization: UserListSerialization,
        type: ENUM_HELPER_FILE_TYPE.CSV,
    })
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.USER_READ,
        ENUM_AUTH_PERMISSIONS.USER_EXPORT
    )
    @AuthJwtAdminAccessProtected()
    @HttpCode(HttpStatus.OK)
    @Post('/export')
    async export(): Promise<IResponse> {
        return this.userService.findAll({});
    }

    @UserBlockedDoc()
    @Response('user.blocked')
    @UserUpdateBlockedGuard()
    @RequestParamGuard(UserRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.USER_READ,
        ENUM_AUTH_PERMISSIONS.USER_UPDATE,
        ENUM_AUTH_PERMISSIONS.USER_BLOCKED
    )
    @AuthJwtAdminAccessProtected()
    @Patch('/update/:user/blocked')
    async blocked(@GetUser() user: IUserEntity): Promise<void> {
        try {
            await this.userService.blocked(user._id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }
}
