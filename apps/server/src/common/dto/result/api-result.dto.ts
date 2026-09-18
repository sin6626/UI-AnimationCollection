import { ApiProperty } from '@nestjs/swagger';

export class ApiResultDto<T = any> {
    @ApiProperty({ description: '业务状态码，200 表示成功', example: 200 })
    code: string | number;

    @ApiProperty({ description: '提示信息', example: 'success' })
    message: string;

    @ApiProperty({ description: '业务数据' })
    data: T;

    constructor(code: string | number, message: string, data: T) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    static success<T>(data: T, message = 'success'): ApiResultDto<T> {
        return new ApiResultDto("200", message, data);
    }

    static error<T = null>(code : string | number, message = "error", data: T = null as T): ApiResultDto<T> {
        return new ApiResultDto(code, message, data);
    }
}
