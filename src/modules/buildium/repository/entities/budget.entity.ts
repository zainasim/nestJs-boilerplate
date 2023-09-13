import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { CallbackWithoutResultAndOptionalError } from 'mongoose';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { DatabaseMongoUUIDEntityAbstract } from 'src/common/database/abstracts/mongo/entities/database.mongo.uuid.entity.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';


export const BudgetsDatabaseName = 'budgets';

@DatabaseEntity({ collection: BudgetsDatabaseName })
export class BudgetsEntity extends DatabaseMongoUUIDEntityAbstract {


    @Prop({ required: true, type: Number })
    id: number;

    @Prop({ required: false, type: String })
    name: string;


    @Prop({ required: false, type: String })
    StartDate: string;

    @Prop({
        required: false,
        type: String,
    })
    propertyId: string;

}

export const BudgetsSchema = SchemaFactory.createForClass(BudgetsEntity);

