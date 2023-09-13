import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoUUIDRepositoryAbstract } from 'src/common/database/abstracts/mongo/repositories/database.mongo.uuid.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';

import { AssociationEntity } from 'src/modules/buildium/repository/entities/assocations.entity';

@Injectable()
export class AssociationRepository extends DatabaseMongoUUIDRepositoryAbstract<AssociationEntity> {
    constructor(
        @DatabaseModel(AssociationEntity.name)
        private readonly associationModel: Model<AssociationEntity>
    ) {
        super(associationModel, {
            path: '',
            localField: '',
            foreignField: '',
            model: AssociationEntity.name,
        });
    }
}
