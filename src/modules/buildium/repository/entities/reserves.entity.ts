import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { CallbackWithoutResultAndOptionalError } from 'mongoose';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { DatabaseMongoUUIDEntityAbstract } from 'src/common/database/abstracts/mongo/entities/database.mongo.uuid.entity.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';


export const ReservesDatabaseName = 'reserves';

@DatabaseEntity({ collection: ReservesDatabaseName })
export class reservesEntity extends DatabaseMongoUUIDEntityAbstract {

    @Prop({ required: true })
    Id: number;
    
    @Prop({ required: true })
    Name: string;
  
  
    @Prop({ required: true })
    Type: string;
    
}

export const reservSchema = SchemaFactory.createForClass(reservesEntity);

