import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, isNotEmpty } from 'class-validator';
import { number, string } from 'yargs';

export class createReserveDto {
    @ApiProperty({
        required: false,
    })
    @IsOptional()
    @Type(() => number)
    readonly id: number;

    @ApiProperty({
        required: false,
    })
    @Type(() => String)
    readonly name: string;

    @ApiProperty({
        required: true,
    })
    @Type(() => String)
    readonly type: string;

}
