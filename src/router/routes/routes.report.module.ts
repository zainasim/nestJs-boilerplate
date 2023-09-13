import { Module } from '@nestjs/common';
import { ReportController } from 'src/modules/report/controllers/report.controller';
import { ReportModule } from 'src/modules/report/report.module';

@Module({
    controllers: [
        ReportController
    ],
    providers: [],
    exports: [],
    imports: [ReportModule],
})
export class RoutesReportModule {}