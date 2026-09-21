import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
    @ApiProperty({ description: '用户名', example: 'zhangsan' })
    @IsString()
    @IsNotEmpty({ message: '用户名不能为空' })
    @MinLength(3, { message: '用户名长度不能少于3位' })
    @MaxLength(20, { message: '用户名长度不能超过20位' })
    nickname: string;

    @ApiProperty({ description: '密码', example: 'Password123!' })
    @IsString()
    @IsNotEmpty({ message: '密码不能为空' })
    @MinLength(6, { message: '密码长度不能少于6位' })
    @MaxLength(32, { message: '密码长度不能超过32位' })
    password: string;

    @ApiProperty({ description: '确认密码', example: 'Password123!' })
    @IsString()
    @IsNotEmpty({ message: '确认密码不能为空' })
    confirmPassword: string;

    @ApiProperty({ description: '邮箱', example: 'test@example.com' })
    @IsEmail({}, { message: '邮箱格式不正确' })
    @IsNotEmpty({ message: '邮箱不能为空' })
    email: string;

    @ApiProperty({ description: '验证码', example: '123456' })
    @IsString()
    @IsNotEmpty({ message: '验证码不能为空' })
    captcha: string;
}
