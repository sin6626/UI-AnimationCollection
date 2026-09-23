import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';

import {LoginRequestDto} from '../dto/request/login.request.dto.js';
import {UserService} from '../service/user.service.js';
import {ApiResultDto} from "../../../common/dto/result/api-result.dto.js";
import {Public} from "../../../common/decorators/public.decorator.js";
import {RefreshTokenRequestDto} from "../dto/request/refreshToken.request.dto.js";
import {RegisterRequestDto} from "../dto/request/register.request.dto.js";

@ApiTags('用户认证')
@Controller()
export class AuthController {
    constructor(private readonly userService: UserService) {
    }

    @Public()
    @Post('/auth/login')
    @ApiOperation({summary: '用户登录'})
    async login(@Body() loginRequestDto: LoginRequestDto): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.userLogin(loginRequestDto));
    }

    @Public()
    @Post('/auth/refreshToken')
    @ApiOperation({summary: '刷新 Token'})
    async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.refreshToken(refreshTokenDto));
    }

    @Post('/auth/logout')
    @ApiOperation({summary: "退出登录"})
    async logout(): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.logout());
    }

    @Public()
    @Post('/auth/register')
    @ApiOperation({summary: "用户注册"})
    async register(@Body() registerRequestDto: RegisterRequestDto): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.register(registerRequestDto));
    }

    @Public()
    @Post('/auth/loginGithub')
    @ApiOperation({summary: 'github login'})
    async loginGithub(): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.loginGithubUrl());
    }

    @Public()
    @Get('/auth/login/github/callback')
    @ApiOperation({summary: 'GitHub 登录回调'})
    async githubCallback(@Query('code') code: string): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.githubLoginCallback(code));
    }

    @Get('/user/info')
    @ApiOperation({summary: '获取用户基础信息'})
    async userInfo(): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.getUserInfo());
    }

}
