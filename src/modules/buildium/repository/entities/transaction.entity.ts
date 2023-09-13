import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DatabaseMongoUUIDEntityAbstract } from 'src/common/database/abstracts/mongo/entities/database.mongo.uuid.entity.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';
import {
    DepositDetails,
    Journal,
    PaymentDetail,
    Transaction,
    UnitAgreement,
} from '../../interfaces/transaction.interface';

export const TransactionDatabaseName = 'transactions';

@DatabaseEntity({ collection: TransactionDatabaseName })
export class TransactionEntity
    extends DatabaseMongoUUIDEntityAbstract
    implements Transaction
{
    @Prop()
    Id: number;

    @Prop()
    Date: string;

    @Prop()
    PropertyId: number;

    @Prop()
    TransactionType: string;

    @Prop()
    TotalAmount: number;

    @Prop()
    CheckNumber: string;

    @Prop({ type: Object })
    UnitAgreement: UnitAgreement;

    @Prop()
    UnitId: number;

    @Prop()
    UnitNumber: string;

    @Prop({ type: Object })
    PaymentDetail: PaymentDetail;

    @Prop({ type: Object })
    DepositDetails: DepositDetails;

    @Prop({ type: Object })
    Journal: Journal;
}

export const transactionSchema =
    SchemaFactory.createForClass(TransactionEntity);
