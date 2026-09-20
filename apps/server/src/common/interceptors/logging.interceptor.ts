import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Request, Response} from 'express';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Repository} from 'typeorm';
import {RequestLogs} from '../../modules/module_logs/entities/request-log.entity.js';
import {ErrorLogs} from '../../modules/module_logs/entities/error-log.entity.js';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    constructor(
        @InjectRepository(RequestLogs)
        private readonly requestLogRepo: Repository<RequestLogs>,
        @InjectRepository(ErrorLogs)
        private readonly errorLogRepo: Repository<ErrorLogs>,
    ) {
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const {method, url, ip} = request;
        const userAgent = request.get('user-agent') || '';
        const now = Date.now();
        this.logger.log(`→ ${method} ${url} - ${ip}`);
        return next.handle().pipe(
            tap({
                next: () => {
                    const responseTime = Date.now() - now;
                    this.logger.log(`← ${method} ${url} ${response.statusCode} - ${responseTime}ms`);
                    this.saveRequestLog({
                        method,
                        url,
                        ip,
                        userAgent,
                        statusCode: response.statusCode,
                        responseTime,
                    });
                },
                error: (err) => {
                    const responseTime = Date.now() - now;
                    const statusCode = err.status || 500;
                    this.logger.error(
                        `← ${method} ${url} ${statusCode} - ${responseTime}ms - ${err.message}`,
                    );
                    this.saveRequestLog({
                        method,
                        url,
                        ip,
                        userAgent,
                        statusCode,
                        responseTime,
                    }).then((reqLog) => {
                        this.saveErrorLog({
                            requestLogId: reqLog?.id ?? null,
                            method,
                            url,
                            statusCode,
                            businessCode: err.code ?? null,
                            errorName: err.name ?? null,
                            errorMessage: err.message ?? 'Unknown error',
                            errorStack: err.stack ?? null,
                            requestBody: this.safeStringify(request.body),
                            queryParams: this.safeStringify(request.query),
                            ip,
                            userId: (request as any).user?.id ?? null,
                        });
                    });
                },
            }),
        );
    }

    private async saveRequestLog(data: {
        method: string;
        url: string;
        ip?: string;
        userAgent?: string;
        statusCode: number;
        responseTime: number;
    }): Promise<RequestLogs | null> {
        try {
            const log = this.requestLogRepo.create({
                method: data.method,
                url: data.url,
                ip: data.ip ?? null,
                userAgent: data.userAgent ?? null,
                statusCode: data.statusCode,
                responseTime: data.responseTime,
            });
            return await this.requestLogRepo.save(log);
        } catch (e) {
            this.logger.error('保存请求日志失败', (e as Error).stack);
            return null;
        }
    }

    private async saveErrorLog(data: Partial<ErrorLogs>): Promise<void> {
        try {
            const log = this.errorLogRepo.create(data);
            await this.errorLogRepo.save(log);
        } catch (e) {
            this.logger.error('保存错误日志失败', (e as Error).stack);
        }
    }

    private safeStringify(obj: any): string | null {
        if (!obj || typeof obj !== 'object') return null;
        try {
            const clone = {...obj};
            const sensitiveKeys = ['password', 'token', 'authorization', 'secret'];
            for (const key of sensitiveKeys) {
                if (key in clone) delete clone[key];
            }
            return JSON.stringify(clone);
        } catch {
            return null;
        }
    }
}
