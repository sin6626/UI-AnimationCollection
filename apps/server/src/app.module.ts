import {Module} from '@nestjs/common';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {ConfigModule} from '@nestjs/config';
import {LoggingInterceptor} from './common/interceptors/logging.interceptor.js';
import {ModulesModule} from "./modules/module.module.js";
import {ClsModule} from "nestjs-cls";
import {AuditSubscriber} from "./common/subscribers/audit.subscriber.js";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true,
                setup: (cls, req) => {
                    const user = (req as any).user;
                    if (user?.id) {
                        cls.set('userId', user.id);
                    }
                },
            },
        }),
        ModulesModule,
    ],
    providers: [
        AuditSubscriber,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class AppModule {
}
