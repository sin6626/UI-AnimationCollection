// users.module.ts
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigService} from '@nestjs/config';

import {UsersEntity} from './entities/users.entity.js';
import {UserThirdPartyEntity} from './entities/user-third-party.entity.js';
import {UserService} from './service/user.service.js';
import {AuthController} from './controller/auth.controller.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UsersEntity,
            UserThirdPartyEntity,
        ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {expiresIn: '1d'},
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {
}
