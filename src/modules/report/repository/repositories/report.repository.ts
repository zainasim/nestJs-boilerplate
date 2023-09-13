import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseMongoUUIDRepositoryAbstract } from 'src/common/database/abstracts/mongo/repositories/database.mongo.uuid.repository.abstract';
import { DatabaseModel } from 'src/common/database/decorators/database.decorator';
import { PermissionEntity } from 'src/modules/permission/repository/entities/permission.entity';
import { ReportEntity } from 'src/modules/report/repository/entities/report.entity';

@Injectable()
export class ReportRepository extends DatabaseMongoUUIDRepositoryAbstract<ReportEntity> {
    constructor(
        @DatabaseModel(ReportEntity.name)
        private readonly reportTModel: Model<ReportEntity>
    ) {
        super(reportTModel, {
            path: '',
            localField: '',
            foreignField: '',
            model: ReportEntity.name,
        });
    }
}
