import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, isUUID } from 'class-validator';


export class UserPasswordUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  newPassword: string;

  @IsNotEmpty()
  @IsUUID('4')
  @Type(() => String)
  _id: string;
}

