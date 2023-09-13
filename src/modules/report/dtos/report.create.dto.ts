import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { isString } from 'lodash';

export class ReportDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  public startdate: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  public enddate: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  public propertyId: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  public budgetId: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  public name?: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  public selectionentitytype: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  public userRole?: string;
}
