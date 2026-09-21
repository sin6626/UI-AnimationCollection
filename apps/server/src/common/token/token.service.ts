import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {RedisService} from '../redis/service/redis.service.js';
import {CommonConstants} from '../constants/common.constants.js';
import {LoginResponseDto} from "../../modules/module_user/dto/response/login.response.dto.js";

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly redis: RedisService,
    ) {
    }

    async verify(token: string): Promise<any> {
        let payload: any;
        try {
            payload = await this.jwtService.verifyAsync(token, {
                secret: this.config.get<string>('JWT_SECRET'),
            });
        } catch (e) {
            throw new UnauthorizedException('token 无效或已过期');
        }
        const key = `${CommonConstants.CACHE_KEY.USER_ACCESS_TOKEN}${payload.sub}`;
        const stored = await this.redis.get(key);
        if (!stored) {
            throw new UnauthorizedException('登录已失效，请重新登录');
        }
        if (stored !== token) {
            throw new UnauthorizedException('账号已在其他地方登录');
        }
        return payload;
    }

    async createToken(id: string): Promise<LoginResponseDto> {
        if (!id) {
            throw new UnauthorizedException('用户不存在');
        }
        const accessExpiresIn = Number(this.config.get('JWT_ACCESS_EXPIRES_IN') ?? 3600);
        const refreshExpiresIn = Number(this.config.get('JWT_REFRESH_EXPIRES_IN') ?? 604800);
        const payload = { sub: id};
        const secret = this.config.get<string>('JWT_SECRET');
        const accessToken = this.jwtService.sign(payload, {
            secret,
            expiresIn: accessExpiresIn,
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret,
            expiresIn: refreshExpiresIn,
        });
        const accessTokenKey = `${CommonConstants.CACHE_KEY.USER_ACCESS_TOKEN}${id}`;
        await this.redis.set(accessTokenKey, accessToken, accessExpiresIn);
        const refreshTokenKey = `${CommonConstants.CACHE_KEY.USER_ACCESS_TOKEN}${id}`;
        await this.redis.set(refreshTokenKey, refreshToken, refreshExpiresIn);
        const now = Date.now();
        const expiresAt = now + accessExpiresIn * 1000;
        const refreshExpiresAt = now + refreshExpiresIn * 1000;
        const loginResponseDto = new LoginResponseDto();
        loginResponseDto.accessToken = accessToken;
        loginResponseDto.refreshToken = refreshToken;
        loginResponseDto.tokenType = 'Bearer';
        loginResponseDto.expiresIn = accessExpiresIn;
        loginResponseDto.expiresAt = expiresAt;
        loginResponseDto.refreshExpiresIn = refreshExpiresIn;
        loginResponseDto.refreshExpiresAt = refreshExpiresAt;
        return loginResponseDto;
    }

}
