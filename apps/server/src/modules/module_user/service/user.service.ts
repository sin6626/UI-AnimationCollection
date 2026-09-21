import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import axios from 'axios';

import {UsersEntity} from '../entities/users.entity.js';
import {UserThirdPartyEntity} from '../entities/user-third-party.entity.js';
import {LoginRequestDto} from '../dto/request/login.request.dto.js';
import {RefreshTokenRequestDto} from '../dto/request/refreshToken.request.dto.js';
import {RegisterRequestDto} from '../dto/request/register.request.dto.js';
import {ThirdPartyProvider} from '../enums/third-party-provider.enum.js';
import {GithubLoginResponseVo} from "../dto/vo/github.login.response.vo.js";
import {CommonConstants} from "../../../common/constants/common.constants.js";
import {TokenService} from "../../../common/token/token.service.js";
import {LoginResponseDto} from "../dto/response/login.response.dto.js";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepository: Repository<UsersEntity>,
        @InjectRepository(UserThirdPartyEntity)
        private readonly thirdPartyRepository: Repository<UserThirdPartyEntity>,
        private readonly tokenService: TokenService,
        private readonly configService: ConfigService,
    ) {
    }

    async userLogin(dto: LoginRequestDto) {
        return undefined;
    }

    async refreshToken(dto: RefreshTokenRequestDto) {
        return undefined;
    }

    async logout() {
        return undefined;
    }

    async register(dto: RegisterRequestDto) {
        return undefined;
    }

    async loginGithubUrl(): Promise<string> {
        const params = new URLSearchParams({
            client_id: this.configService.get<string>('GITHUB_CLIENT_ID')!,
            redirect_uri: this.configService.get<string>('GITHUB_CALLBACK_URL')!,
            scope: 'read:user user:email',
        });
        return `https://github.com/login/oauth/authorize?${params}`;
    }

    async githubLoginCallback(code: string): Promise<LoginResponseDto> {
        const accessToken = await this.getAccessToken(code);
        const profile = await this.getGithubUserInfo(accessToken);
        return await this.verifyAndCreateUserInfo(profile);
    }

    private async getAccessToken(code: string): Promise<string> {
        const response = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
                client_secret: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
                code,
                redirect_uri: this.configService.get<string>('GITHUB_CALLBACK_URL'),
            },
            {headers: {Accept: 'application/json'}},
        );

        if (!response.data.access_token) {
            this.logger.error(`GitHub token 交换失败: ${JSON.stringify(response.data)}`);
            throw new Error(`GitHub token 交换失败`);
        }
        return response.data.access_token;
    }

    private async getGithubUserInfo(accessToken: string): Promise<GithubLoginResponseVo> {
        const userRes = await axios.get('https://api.github.com/user', {
            headers: {Authorization: `Bearer ${accessToken}`},
        });
        let email: string | null = userRes.data.email ?? null;
        if (!email) {
            try {
                const emailRes = await axios.get('https://api.github.com/user/emails', {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
                const primary = emailRes.data.find((e: any) => e.primary && e.verified);
                email = primary?.email ?? null;
            } catch (e) {
                this.logger.warn('获取 GitHub 邮箱失败，用户可能未授权 user:email');
            }
        }
        const githubLoginResponseVo = new GithubLoginResponseVo();
        githubLoginResponseVo.id = String(userRes.data.id);
        githubLoginResponseVo.username = userRes.data.login;
        githubLoginResponseVo.displayName = userRes.data.name ?? null;
        githubLoginResponseVo.avatar = userRes.data.avatar_url ?? null;
        githubLoginResponseVo.profileUrl = userRes.data.html_url ?? null;
        githubLoginResponseVo.email = email;
        githubLoginResponseVo.raw = userRes.data;
        return githubLoginResponseVo;
    }

    private async verifyAndCreateUserInfo(profile: GithubLoginResponseVo): Promise<LoginResponseDto> {
        const userThirdPartyEntity = await this.thirdPartyRepository.findOne({
            where: {provider: ThirdPartyProvider.GITHUB, openId: profile.id},
            relations: {user: CommonConstants.BOOLEAN.TRUE},
        });
        if (userThirdPartyEntity && userThirdPartyEntity.user) {
            return this.tokenService.createToken(userThirdPartyEntity.user.id);
        }
        const newUserEntity = new UsersEntity();
        newUserEntity.nickName = profile.displayName;
        newUserEntity.avatarUrl = profile.avatar;
        newUserEntity.signature = profile.profileUrl;
        newUserEntity.email = profile.email;
        const usersEntity = await this.userRepository.save(newUserEntity);
        const newUserThirdPartyEntity = new UserThirdPartyEntity();
        newUserThirdPartyEntity.user = usersEntity;
        newUserThirdPartyEntity.username = profile.username;
        newUserThirdPartyEntity.email = profile.email;
        newUserThirdPartyEntity.userId = usersEntity.id
        newUserThirdPartyEntity.avatar = profile.avatar;
        newUserThirdPartyEntity.provider = ThirdPartyProvider.GITHUB;
        newUserThirdPartyEntity.rawData = profile.raw;
        newUserThirdPartyEntity.openId = profile.id;
        await this.thirdPartyRepository.save(newUserThirdPartyEntity);
        return this.tokenService.createToken(usersEntity.id);
    }
}
