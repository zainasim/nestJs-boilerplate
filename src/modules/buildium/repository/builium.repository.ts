import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_NAME } from 'src/common/database/constants/database.constant';
import {
    AssociationEntity,
    associationsSchema,
} from 'src/modules/buildium/repository/entities/assocations.entity';
import { AssociationRepository } from 'src/modules/buildium/repository/repositories/association.repository';

import {
    glaccountsEntity,
    glaccountsSchema,
} from 'src/modules/buildium/repository/entities/glaccounts.entity';

import {
    BudgetsEntity,
    BudgetsSchema,
} from 'src/modules/buildium/repository/entities/budget.entity';
import { glAccountRepository } from 'src/modules/buildium/repository/repositories/glaccounts.repository';
import { budgetsRepository } from 'src/modules/buildium/repository/repositories/budget.repositories';
import { reservesRepository } from './repositories/reserves.repository';
import { reservesEntity } from './entities/reserves.entity';
import { reservSchema } from './entities/reserves.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransactionEntity, transactionSchema } from './entities/transaction.entity';

@Module({
    providers: [
        AssociationRepository,
        glAccountRepository,
        budgetsRepository,
        reservesRepository,
        TransactionRepository
    ],
    exports: [
        AssociationRepository,
        glAccountRepository,
        budgetsRepository,
        reservesRepository,
        TransactionRepository

    ],
    controllers: [],
    imports: [
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
                    name: reservesEntity.name,
                    schema: reservSchema,
                },
                {
                    name: TransactionEntity.name,
                    schema: transactionSchema,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class AssociationRepositoryModule {}
