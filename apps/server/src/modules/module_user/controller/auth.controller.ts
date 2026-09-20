import {Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse} from '@nestjs/swagger';

import {LoginRequestDto} from '../dto/request/login.request.dto.js';
import {UserService} from '../service/user.service.js';
import {ApiResultDto} from "../../../common/dto/result/api-result.dto.js";
import {Public} from "../../../common/decorators/public.decorator.js";
import {RefreshTokenRequestDto} from "../dto/request/refreshToken.request.dto.js";

@ApiTags('用户认证')
@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Post('/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: '用户登录' })
    @ApiBody({
        type: LoginRequestDto,
        description: '登录所需的账号和密码'
    })
    @ApiOkResponse({
        type: ApiResultDto,
        description: '登录成功，返回 Token 和用户信息'
    })
    @ApiUnauthorizedResponse({
        description: '账号或密码错误'
    })
    async login(@Body() loginRequestDto: LoginRequestDto): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.userLogin(loginRequestDto));
    }

    @Public()
    @Post('/refreshToken')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: '刷新 Token' })
    @ApiBody({
        type: RefreshTokenRequestDto,
        description: '传入过期的 Refresh Token 以获取新的 Access Token'
    })
    @ApiOkResponse({
        type: ApiResultDto,
        description: '刷新成功，返回新的 Token'
    })
    @ApiUnauthorizedResponse({
        description: 'Refresh Token 无效或已过期'
    })
    async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto ): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.refreshToken(refreshTokenDto));
    }

    @Post('/logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: "退出登录" })
    @ApiOkResponse({
        type: ApiResultDto,
        description: '退出成功'
    })
    @ApiUnauthorizedResponse({
        description: '未登录或 Token 失效'
    })
    async logout(): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.userService.logout());
    }
}
