import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoUUIDRepositoryAbstract } from 'src/common/database/abstracts/mongo/repositories/database.mongo.uuid.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';

import { BudgetsEntity } from 'src/modules/buildium/repository/entities//budget.entity';

@Injectable()
export class budgetsRepository extends DatabaseMongoUUIDRepositoryAbstract<BudgetsEntity> {
    constructor(
        @DatabaseModel(BudgetsEntity.name)
        private readonly associationModel: Model<BudgetsEntity>
    ) {
        super(associationModel, {
            path: '',
            localField: '',
            foreignField: '',
            model: BudgetsEntity.name,
        });
    }
}
