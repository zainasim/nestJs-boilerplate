import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, isNotEmpty } from 'class-validator';
import { number } from 'yargs';

export class createBudgetsDto {
    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional()
    @Type(() => number)
    readonly id: number;

    @ApiProperty({
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    @Type(() => String)
    readonly name: string;

    @ApiProperty({
        required: true,
    })
    @Type(() => number)
    readonly propertyId: number;

}
