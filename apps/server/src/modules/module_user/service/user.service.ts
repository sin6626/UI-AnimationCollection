import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {UsersEntity} from "../entities/users.entity.js";
import {LoginRequestDto} from "../dto/request/login.request.dto.js";
import {RefreshTokenRequestDto} from "../dto/request/refreshToken.request.dto.js";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepo: Repository<UsersEntity>,
    ) {}

    async userLogin(loginRequestDto: LoginRequestDto) {

        return undefined;
    }

    async refreshToken(refreshTokenDto: RefreshTokenRequestDto) {

        return undefined;
    }

    async logout() {
        return undefined;
    }

}
