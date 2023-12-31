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
import { IsPasswordStrong } from 'src/common/request/validations/request.is-password-strong.validation';
import { MobileNumberAllowed } from 'src/common/request/validations/request.mobile-number-allowed.validation';

export class UserCreateDto {
    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    @Type(() => String)
    readonly username?: string;

    @ApiProperty({
       
        required: true,
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    @Type(() => String)
    readonly email: string;

    @ApiProperty({
        
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(30)
    @Type(() => String)
    readonly firstName: string;

    @ApiProperty({
    
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(30)
    @Type(() => String)
    readonly lastName: string;

    // @ApiProperty({
    //     example: faker.phone.number('62812#########'),
    //     required: true,
    // })
    // @IsString()
    // @IsOptional()
    // @MinLength(10)
    // @MaxLength(14)
    // // @ValidateIf((e) => e.mobileNumber !== '')
    // @Type(() => String)
    // // @MobileNumberAllowed()
    // readonly mobileNumber?: string;

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
    // @IsPasswordStrong()
    readonly password: string;
}
