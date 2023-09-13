import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { AssociationGetSerialization } from './association.get.serialization';
import { includes } from 'lodash';

export class AssociationListSerialization extends OmitType(
    AssociationGetSerialization,
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
