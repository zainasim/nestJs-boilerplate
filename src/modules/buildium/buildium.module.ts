import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { AssociationService } from './services/buildium.service';
import { AssociationRepositoryModule } from 'src/modules/buildium/repository/builium.repository';
import { glAccountService } from './services/glaccount.service';
import { budgetService } from './services/budget.service';
// import { glAccountRepository } from './repository/repositories/glaccounts.repository';
import { TransactionService } from './services/transaction.service';

@Module({
    controllers: [],

    providers: [AssociationService, glAccountService, budgetService, TransactionService],

    exports: [
        AssociationService,
        glAccountService,
        budgetService,
        TransactionService,
        AssociationRepositoryModule,
    ],

    imports: [AssociationRepositoryModule, HttpModule],
})
export class BuildiumModule {}
