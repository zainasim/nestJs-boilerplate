import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MaxLength,
    MinLength,
    IsUUID,
    IsOptional,
    ValidateIf,
} from 'class-validator';
import { IAuthPassword } from 'src/common/auth/interfaces/auth.interface';
import { IsPasswordStrong } from 'src/common/request/validations/request.is-password-strong.validation';
import { MobileNumberAllowed } from 'src/common/request/validations/request.mobile-number-allowed.validation';

export class UpdateUserDto {
    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    @Type(() => String)
    readonly firstName?: string;

    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    @Type(() => String)
    readonly lastName?: string;

    @ApiProperty({
        required: false,
    })
    @IsEmail()
    @IsOptional()
    @MaxLength(100)
    @Type(() => String)
    readonly email: string;


    @ApiProperty({

        required: false,
    })
    @IsOptional()
    @IsUUID('4')
    readonly role: string;

    @ApiProperty({

        required: false,
    })
    @IsOptional()

    public password: any;

}
