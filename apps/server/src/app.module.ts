import {Module} from '@nestjs/common';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {ConfigModule} from '@nestjs/config';
import {LogsModule} from './modules/module_logs/module.logs.js';
import {LoggingInterceptor} from './common/interceptors/logging.interceptor.js';
import {RedisModule} from "./common/redis/redis.module.js";
import {MysqlModule} from "./common/mysql/mysql.module.js";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MysqlModule,
        LogsModule,
        RedisModule,
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
