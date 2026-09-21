import {Module} from '@nestjs/common';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {ConfigModule} from '@nestjs/config';
import {LogsModule} from './modules/module_logs/module.logs.js';
import {LoggingInterceptor} from './common/interceptors/logging.interceptor.js';
import {RedisModule} from "./common/redis/redis.module.js";
import {MysqlModule} from "./common/mysql/mysql.module.js";
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
        MysqlModule,
        LogsModule,
        RedisModule,
        ModulesModule,
        AuditSubscriber,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class AppModule {
}
