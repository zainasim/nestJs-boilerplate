import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoUUIDRepositoryAbstract } from 'src/common/database/abstracts/mongo/repositories/database.mongo.uuid.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';

import { glaccountsEntity } from 'src/modules/buildium/repository/entities/glaccounts.entity';

@Injectable()
export class glAccountRepository extends DatabaseMongoUUIDRepositoryAbstract<glaccountsEntity> {
    constructor(
        @DatabaseModel(glaccountsEntity.name)
        private readonly associationModel: Model<glaccountsEntity>
    ) {
        super(associationModel, {
            path: '',
            localField: '',
            foreignField: '',
            model: glaccountsEntity.name,
        });
    }
}
