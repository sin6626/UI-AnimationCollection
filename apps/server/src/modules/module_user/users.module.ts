// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity.js';
import { UserService } from './service/user.service.js';
import { AuthController } from './controller/auth.controller.js';

@Module({
    imports: [TypeOrmModule.forFeature([UsersEntity])],  // ← 关键
    controllers: [AuthController],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {}
