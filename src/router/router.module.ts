import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';
import { RouterModule as NestJsRouterModule } from '@nestjs/core';
import { RoutesAdminModule } from './routes/routes.admin.module';
import { RoutesCallbackModule } from './routes/routes.callback.module';
import { RoutesModule } from './routes/routes.module';
import { RoutesPublicModule } from './routes/routes.public.module';
import { RoutesTestModule } from './routes/routes.test.module';
import { RoutesBuildiumModule } from './routes/routes.buildium.module';
import { RoutesReportModule } from './routes/routes.report.module';

@Module({})
export class RouterModule {
    static forRoot(): DynamicModule {
        const imports: (
            | DynamicModule
            | Type<any>
            | Promise<DynamicModule>
            | ForwardReference<any>
        )[] = [];

        if (process.env.HTTP_ENABLE === 'true') {
            imports.push(
                RoutesModule,
                RoutesTestModule,
                RoutesPublicModule,
                RoutesAdminModule,
                RoutesCallbackModule,
                RoutesBuildiumModule,
                RoutesReportModule,
                NestJsRouterModule.register([
                    {
                        path: '/',
                        module: RoutesModule,
                    },
                    {
                        path: '/test',
                        module: RoutesTestModule,
                    },
                    {
                        path: '/public',
                        module: RoutesPublicModule,
                    },
                    {
                        path: '/admin',
                        module: RoutesAdminModule,
                    },
                    {
                        path: '/callback',
                        module: RoutesCallbackModule,
                    },
                    {
                        path: '/buildium',
                        module: RoutesBuildiumModule,
                    },
                    {
                        path: '/custom',
                        module: RoutesReportModule,
                    },
                ])
            );
        }

        return {
            module: RouterModule,
            providers: [],
            exports: [],
            controllers: [],
            imports,
        };
    }
}
