import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, ValidateNested, IsBoolean, IsOptional } from 'class-validator';

export class SubAccountDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  readonly Id: number;

  @ApiProperty({ required: true })
  @IsString()
  @Type(() => String)
  readonly AccountNumber: string;

  @ApiProperty({ required: true })
  @IsString()
  @Type(() => String)
  readonly Name: string;

  @ApiProperty({ required: false })
  @IsString()
  @Type(() => String)
  readonly Description: string;

  @ApiProperty({ required: true })
  @IsString()
  @Type(() => String)
  readonly Type: string;

  @ApiProperty({ required: true })
  @IsString()
  @Type(() => String)
  readonly SubType: string;

  @ApiProperty({ required: true })
  @IsBoolean()
  @Type(() => Boolean)
  readonly IsDefaultGLAccount: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @Type(() => String)
  readonly DefaultAccountName: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @Type(() => Boolean)
  readonly IsContraAccount: boolean;

  @ApiProperty({ required: true })
  @IsBoolean()
  @Type(() => Boolean)
  readonly IsBankAccount: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @Type(() => String)
  readonly CashFlowClassification: string;

  @ApiProperty({ required: true })
  @IsBoolean()
  @Type(() => Boolean)
  readonly ExcludeFromCashBalances: boolean;

  @ApiProperty({ required: false, isArray: true, type: SubAccountDto })
  @ValidateNested({ each: true })
  @Type(() => SubAccountDto)
  readonly SubAccounts: SubAccountDto[];

  @ApiProperty({ required: true })
  @IsBoolean()
  @Type(() => Boolean)
  readonly IsActive: boolean;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly ParentGLAccountId: number;
}
