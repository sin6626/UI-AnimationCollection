import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
    @ApiProperty({ description: '登录邮箱', example: 'user@example.com' })
    @IsEmail({}, { message: '邮箱格式不正确' })
    @IsNotEmpty({ message: '邮箱不能为空' })
    email: string;

    @ApiProperty({ description: '密码（前端加密后传）', example: 'xxxxxx' })
    @IsString()
    @IsNotEmpty({ message: '密码不能为空' })
    password: string;
}
