import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import {
    ReportEntity,
    ReportSchema,
} from 'src/modules/report/repository/entities/report.entity';
import { ReportRepository } from 'src/modules/report/repository/repositories/report.repository';

@Module({
    providers: [ReportRepository],
    exports: [ReportRepository],
    controllers: [],
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: ReportEntity.name,
                    schema: ReportSchema,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class ReportRepositoryModule {}
