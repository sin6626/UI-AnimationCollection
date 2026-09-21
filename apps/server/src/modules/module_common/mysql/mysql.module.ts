// database.module.ts
import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'mysql',
                host: config.get<string>('DB_HOST', 'localhost'),
                port: config.get<number>('DB_PORT', 3306),
                username: config.get<string>('DB_USER', 'root'),
                password: config.get<string>('DB_PASSWORD', ''),
                database: config.get<string>('DB_NAME', 'typescript_dev'),
                autoLoadEntities: true,
                synchronize: true,
                logging: true,
            }),
        }),
    ],
})
export class MysqlModule {
}
