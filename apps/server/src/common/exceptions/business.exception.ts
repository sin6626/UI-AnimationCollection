import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
    readonly code: string;

    constructor(code: string, message: string) {
        super({ code, message }, HttpStatus.BAD_REQUEST);
        this.code = code;
    }

    static readonly PARAM_INVALID = new BusinessException("1000_1001", '参数无效');
    static readonly UNAUTHORIZED = new BusinessException("1000_1002", '未登录');
    static readonly FORBIDDEN = new BusinessException("1000_1003", '无权限');
    static readonly NOT_FOUND = new BusinessException("1000_1004", '资源不存在');
    static readonly PARAMETER_IS_EMPTY = new BusinessException("1000_1005", "参数为空");

    static readonly USER_NOT_FOUND = new BusinessException("1000_2001", '用户不存在');
    static readonly USER_PASSWORD_WRONG = new BusinessException("1000_2002", '密码错误');
    static readonly USER_ALREADY_EXISTS = new BusinessException("1000_2003", '用户已存在');

}
