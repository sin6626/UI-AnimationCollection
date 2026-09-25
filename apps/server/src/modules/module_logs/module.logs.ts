import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RequestLogs} from './entities/request-log.entity.js';
import {ErrorLogs} from "./entities/error-log.entity.js";

@Module({
    imports: [TypeOrmModule.forFeature([RequestLogs, ErrorLogs])],
    exports: [TypeOrmModule],
})
export class LogsModule {
}
