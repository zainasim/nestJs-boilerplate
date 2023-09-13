import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { CallbackWithoutResultAndOptionalError } from 'mongoose';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { DatabaseMongoUUIDEntityAbstract } from 'src/common/database/abstracts/mongo/entities/database.mongo.uuid.entity.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';

export const ReportDatabaseName = 'reports';

@DatabaseEntity({ collection: ReportDatabaseName })
export class ReportEntity extends DatabaseMongoUUIDEntityAbstract {


    @Prop({ required: false, type: String })
    name: string;

    @Prop({ required: false, type: String })
    startdate: string;

    @Prop({ required: false, type: String })
    enddate: string;

    @Prop({
        required: false,
        type: Number,
    })
    budgetId: number;

    @Prop({
        required: false,
        type: Number,
    })
    propertyId: number;

    @Prop({
        required: false,
        type: String,
    })
    selectionentitytype: string;  

    @Prop({
        required: false,
        type: Object, // This allows storing JSON objects without a defined schema structure
      })
      data: any;
}

export const ReportSchema = SchemaFactory.createForClass(ReportEntity);
