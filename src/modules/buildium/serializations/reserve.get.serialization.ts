import { faker } from '@faker-js/faker';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';

export class reservesEntityGetSerialization {
    @ApiProperty({ example: faker.datatype.uuid() })
    @Type(() => String)
    readonly _id: string;

    @ApiProperty({
   
    })
    readonly Name: string;

    @ApiProperty({
        
    })
    readonly id: string;

    @ApiProperty({
    })
    readonly Type: string;


    @ApiProperty({
        description: 'Date created at',
        example: faker.date.recent(),
        required: true,
    })
    readonly createdAt: Date;

    @ApiProperty({
        description: 'Date updated at',
        example: faker.date.recent(),
        required: true,
    })
    readonly updatedAt: Date;

    @Exclude()
    readonly deletedAt?: Date;
}
