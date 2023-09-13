import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PropertyDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  readonly id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()

  @Type(() => String)
  readonly propertyName: string;

  @ApiProperty({
    required: true,
  })
  @IsString()

  @Type(() => String)
  readonly location: string;

  @ApiProperty({
    required: true,
  })
  @IsString()

  @Type(() => String)
  readonly propertyManager: string;
}
