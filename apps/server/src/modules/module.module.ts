// module.ts
import { Module } from '@nestjs/common';
import { CommonModule } from './module_common/common.module.js';
import { LogsModule } from './module_logs/module.logs.js';
import { UsersModule } from './module_user/users.module.js';
import { EmailModule } from './module_email/email.module.js';

@Module({
    imports: [CommonModule, LogsModule, UsersModule, EmailModule],
    exports: [CommonModule, LogsModule, UsersModule, EmailModule],
})
export class ModulesModule {}
