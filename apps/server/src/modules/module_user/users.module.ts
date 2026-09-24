import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

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
    ],
    controllers: [AuthController],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {
}
