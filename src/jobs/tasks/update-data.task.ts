import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { budgetService } from 'src/modules/buildium/services/budget.service';
import { glAccountService } from 'src/modules/buildium/services/glaccount.service';
import { AssociationService } from 'src/modules/buildium/services/buildium.service';
import { ReportService } from 'src/modules/report/services/report.service';

@Injectable()
export class UpdateDataTask {
    constructor(
        private readonly budgetService: budgetService,
        private readonly glAccountService: glAccountService,
        private readonly associationService: AssociationService,
        private readonly reportService: ReportService

    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        name: 'updateData',
    })
    async inactiveApiKey(): Promise<void> {

        try {
            console.log('cron');
            // Update Associations
            await this.associationService.fetchAssiations();

            // Update Budget
            await this.budgetService.fetchBudgets();

            // Update GLAccounts
            await this.glAccountService.fetchGlAccounts();
            await this.glAccountService.fetchAndCreateReserves();

            await this.reportService.updateExistingReport()
            
        } catch (err: any) {
            throw new Error(err.message);
        }

        return;
    }
}
