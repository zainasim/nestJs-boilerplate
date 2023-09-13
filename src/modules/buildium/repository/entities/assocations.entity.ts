import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { CallbackWithoutResultAndOptionalError } from 'mongoose';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { DatabaseMongoUUIDEntityAbstract } from 'src/common/database/abstracts/mongo/entities/database.mongo.uuid.entity.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';


export const AssiciationsDatabaseName = 'associations';

@DatabaseEntity({ collection: AssiciationsDatabaseName })
export class AssociationEntity extends DatabaseMongoUUIDEntityAbstract {


    @Prop({ required: true, type: Number })
    id: number;

    @Prop({ required: false, type: String })
    propertyName: string;

    @Prop({
        required: false,
        type: String,
    })
    location: string;

    @Prop({
        required: false,
        type: String,
    })
    propertyManager: string;

}

export const associationsSchema = SchemaFactory.createForClass(AssociationEntity);

