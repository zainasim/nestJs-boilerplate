import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SubAccountDto } from 'src/modules/buildium/dtos/subaccounts.dto';

export class glAaccountDto {

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  readonly Id: number;

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
  @IsNotEmpty()
  @Type(() => Boolean)
  readonly IsDefaultGLAccount: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @Type(() => String)
  readonly DefaultAccountName: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @Type(() => Boolean)
  readonly IsContraAccount: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Type(() => Boolean)
  readonly IsBankAccount: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @Type(() => String)
  readonly CashFlowClassification: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @Type(() => Boolean)
  readonly ExcludeFromCashBalances: boolean;

  @ApiProperty({ required: false, type: () => [SubAccountDto] })
  @Type(() => SubAccountDto)
  readonly SubAccounts: SubAccountDto[];

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @Type(() => Boolean)
  readonly IsActive: boolean;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly ParentGLAccountId: number;
}
