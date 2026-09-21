import {Module} from "@nestjs/common";
import {MysqlModule} from "./mysql/mysql.module.js";
import {RedisModule} from "./redis/redis.module.js";
import {TokenModule} from "./token/token.module.js";

@Module({
    imports: [
        MysqlModule,
        RedisModule,
        TokenModule,
    ],
    exports: [
        MysqlModule,
        RedisModule,
        TokenModule,
    ]
})
export class CommonModule {
}
