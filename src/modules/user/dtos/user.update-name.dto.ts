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

export class UserUpdateDto {
    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    @Type(() => String)
    readonly username?: string;

    @ApiProperty({
        example: faker.internet.email(),
        required: true,
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    @Type(() => String)
    readonly email: string;


    @ApiProperty({
        example: faker.datatype.uuid(),
        required: true,
    })
    @IsNotEmpty()
    @IsUUID('4')
    readonly role: string;

    @ApiProperty({
        description: 'string password',
        required: true,
    })
    @IsNotEmpty()
    @IsPasswordStrong()
    public password: IAuthPassword;


}
