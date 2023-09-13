import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoUUIDRepositoryAbstract } from 'src/common/database/abstracts/mongo/repositories/database.mongo.uuid.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';

import { reservesEntity } from 'src/modules/buildium/repository/entities/reserves.entity';

@Injectable()
export class reservesRepository extends DatabaseMongoUUIDRepositoryAbstract<reservesEntity> {
    constructor(
        @DatabaseModel(reservesEntity.name)
        private readonly reservesEntityModel: Model<reservesEntity>
    ) {
        super(reservesEntityModel, {
            path: '',
            localField: '',
            foreignField: '',
            model: reservesEntity.name,
        });
    }
}
