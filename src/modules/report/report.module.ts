import { Module } from '@nestjs/common';
import { ReportService } from './services/report.service';
import { HttpModule } from '@nestjs/axios';
import { glAccountService } from '../buildium/services/glaccount.service';
import { BuildiumModule } from '../buildium/buildium.module';
import { glAccountRepository } from '../buildium/repository/repositories/glaccounts.repository';
import { AssociationRepositoryModule } from '../buildium/repository/builium.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import {
    AssociationEntity,
    associationsSchema,
} from '../buildium/repository/entities/assocations.entity';
import {
    BudgetsEntity,
    BudgetsSchema,
} from '../buildium/repository/entities/budget.entity';
import {
    glaccountsEntity,
    glaccountsSchema,
} from '../buildium/repository/entities/glaccounts.entity';

import {
    ReportSchema,
    ReportEntity,
} from '../report/repository/entities/report.entity';
import { ReportRepository } from './repository/repositories/report.repository';
import { ReportRepositoryModule } from './repository/report.repository.module';
import { TransactionService } from '../buildium/services/transaction.service';

@Module({
    controllers: [],
    providers: [
        ReportService,
        glAccountService,
        glAccountRepository,
        ReportRepository,
        AssociationRepositoryModule,
        TransactionService
    ],
    exports: [ReportService, ReportRepository],
    imports: [
        HttpModule,
        BuildiumModule,
        ReportRepositoryModule,
        MongooseModule.forFeature(
            [
                {
                    name: AssociationEntity.name,
                    schema: associationsSchema,
                },
                {
                    name: glaccountsEntity.name,
                    schema: glaccountsSchema,
                },
                {
                    name: BudgetsEntity.name,
                    schema: BudgetsSchema,
                },
                {
                    name: ReportEntity.name,
                    schema: ReportSchema,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class ReportModule {}
