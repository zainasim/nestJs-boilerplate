import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class getGlAccountsDto {
    @ApiProperty({
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    readonly Type: String;

    @ApiProperty({
        required: true,
    })
    @IsBoolean()
    @Type(() => Boolean)
    readonly IsDefaultGLAccount: boolean;

}
