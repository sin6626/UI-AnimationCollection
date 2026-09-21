// module.ts
import { Module } from '@nestjs/common';
import { LogsModule } from './module_logs/module.logs.js';
import { UsersModule } from './module_user/users.module.js';

@Module({
    imports: [LogsModule, UsersModule],
    exports: [LogsModule, UsersModule],
})
export class ModulesModule {}
