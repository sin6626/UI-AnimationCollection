// common/middleware/context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../context/request-context.js';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        requestContext.run({}, () => {
            next();
        });
    }
}
