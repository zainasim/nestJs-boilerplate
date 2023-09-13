import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { CallbackWithoutResultAndOptionalError } from 'mongoose';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { DatabaseMongoUUIDEntityAbstract } from 'src/common/database/abstracts/mongo/entities/database.mongo.uuid.entity.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';


export const GlAccountDatabaseName = 'glaccounts';

@DatabaseEntity({ collection: GlAccountDatabaseName })
export class glaccountsEntity extends DatabaseMongoUUIDEntityAbstract {

    @Prop({ required: true })
    Id: number;
  
    @Prop()
    AccountNumber: string;
  
    @Prop({ required: true })
    Name: string;
  
    @Prop()
    Description: string;
  
    @Prop({ required: true })
    Type: string;
  
    @Prop({ required: false })
    SubType: string;
  
    @Prop({ })
    IsDefaultGLAccount: boolean;
  
    @Prop()
    DefaultAccountName: string;
  
    @Prop({ default: false })
    IsContraAccount: boolean;
  
    @Prop({ default: false })
    IsBankAccount: boolean;
  
    @Prop({ required: false })
    CashFlowClassification: string;
  
    @Prop({ default: false })
    ExcludeFromCashBalances: boolean;
  
    @Prop()
    SubAccounts: any[];
  
    @Prop({ default: true })
    IsActive: boolean;
  
    @Prop({ required: false })
    ParentGLAccountId: number;
  

}

export const glaccountsSchema = SchemaFactory.createForClass(glaccountsEntity);

