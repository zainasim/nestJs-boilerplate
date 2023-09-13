import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { IsPasswordStrong } from 'src/common/request/validations/request.is-password-strong.validation';

export class UserChangePasswordDto {
    @ApiProperty({
        description:
            "new string password, newPassword can't same with oldPassword",

        required: true,
    })

    @IsNotEmpty()
    readonly newPassword: string;

    @ApiProperty({
        description: 'old string password',
        example: `${faker.random.alphaNumeric(5).toLowerCase()}${faker.random
            .alphaNumeric(5)
            .toUpperCase()}@@!123`,
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    readonly oldPassword: string;

    @IsString()
    @IsNotEmpty()
    readonly _id: string;
}
