import { Module } from '@nestjs/common';
import { ApiKeyModule } from 'src/common/api-key/api-key.module';
import { BuildiumModule } from 'src/modules/buildium/buildium.module';
import { UpdateDataTask } from '../tasks/update-data.task';
import { ApiKeyInactiveTask } from 'src/common/api-key/tasks/api-key.inactive.task';
import { ReportModule } from 'src/modules/report/report.module';

@Module({
    providers: [UpdateDataTask],
    exports: [],
    imports: [BuildiumModule, ReportModule],
    controllers: [],
})
export class JobsRouterModule {}
