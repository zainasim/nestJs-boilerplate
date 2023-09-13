import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoUUIDRepositoryAbstract } from 'src/common/database/abstracts/mongo/repositories/database.mongo.uuid.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';

import { TransactionEntity } from 'src/modules/buildium/repository/entities/transaction.entity';

@Injectable()
export class TransactionRepository extends DatabaseMongoUUIDRepositoryAbstract<TransactionEntity> {
    constructor(
        @DatabaseModel(TransactionEntity.name)
        private readonly transactionEntityyModel: Model<TransactionEntity>
    ) {
        super(transactionEntityyModel, {
            path: '',
            localField: '',
            foreignField: '',
            model: TransactionEntity.name,
        });
    }
}
