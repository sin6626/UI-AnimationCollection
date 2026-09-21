// common/guards/jwt-auth.guard.ts

import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import {CommonConstants} from '../constants/common.constants.js';
import {requestContext} from "../context/request-context.js";
import {Reflector} from "@nestjs/core";
import {TokenService} from "../../modules/module_common/token/service/token.service.js";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly tokenService: TokenService,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            CommonConstants.IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) return true;
        const req = context.switchToHttp().getRequest();
        const auth = req.headers['authorization'] as string | undefined;
        if (!auth || !auth.startsWith('Bearer ')) {
            throw new UnauthorizedException('未提供 token');
        }
        const token = auth.slice(7);
        try {
            const payload = await this.tokenService.verify(token);
            const user = {id: payload.sub, email: payload.email};
            req.user = user;
            const store = requestContext.getStore();
            if (store) store.user = user;
            return true;
        } catch (e) {
            if (e instanceof UnauthorizedException) throw e;
            throw new UnauthorizedException('token 无效或已过期');
        }
    }
}
