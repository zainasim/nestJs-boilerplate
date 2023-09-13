import { faker } from '@faker-js/faker';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';

export class AssociationGetSerialization {
    @ApiProperty({ example: faker.datatype.uuid() })
    @Type(() => String)
    readonly _id: string;

    @ApiProperty({
        example: faker.internet.userName(),
    })
    readonly propertyName: string;

    @ApiProperty({
        example: faker.internet.email(),
    })
    readonly id: string;

    @ApiProperty({
        example: faker.internet.email(),
    })
    readonly location?: string;

    @ApiProperty({
        example: true,
    })
    readonly isActive: boolean;

    @ApiProperty({
        example: true,
    })
    readonly propertyManager: boolean;

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
