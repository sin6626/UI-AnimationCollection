import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import {Response} from 'express';
import {BusinessException} from '../exceptions/business.exception.js';
import {ApiResultDto} from '../dto/result/api-result.dto.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let code: string | number = 500;
        let message = 'Internal server error';
        if (exception instanceof BusinessException) {
            httpStatus = exception.getStatus();
            code = exception.code;
            message = exception.message;
        } else if (exception instanceof HttpException) {
            httpStatus = exception.getStatus();
            code = httpStatus;
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object' && res !== null) {
                const r = res as any;
                message = Array.isArray(r.message) ? r.message.join(', ') : r.message;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }
        this.logger.error(`[${httpStatus}] [${code}] ${message}`);
        response.status(httpStatus).json(ApiResultDto.error(code, message));
    }
}
