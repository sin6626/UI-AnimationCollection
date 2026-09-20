import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {RedisService} from '../redis/service/redis.service.js';  // ← 你的 redis 服务
import {CommonConstants} from '../constants/common.constants.js';

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
        // todo 常量类中的redis，key
        const key = `${CommonConstants.CACHE_KEY.USER_TOKEN}${payload.sub}`;
        const stored = await this.redis.get(key);
        if (!stored) {
            throw new UnauthorizedException('登录已失效，请重新登录');
        }
        if (stored !== token) {
            throw new UnauthorizedException('账号已在其他地方登录');
        }
        return payload;
    }
}
