import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { reservesEntityGetSerialization } from './reserve.get.serialization';
import { includes } from 'lodash';

export class ReserveListSerialization extends OmitType(
    reservesEntityGetSerialization,
    ['deletedAt', 'createdAt','updatedAt'] as const
) {
    // @includes()
    // readonly role: string;

    @Exclude()
    readonly deletedAt?: Date;

    @Exclude()
    readonly createdAt?: Date;

    @Exclude()
    readonly updatedAt?: Date;

}
