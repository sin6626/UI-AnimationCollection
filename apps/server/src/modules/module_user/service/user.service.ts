import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';
import {ClsService} from 'nestjs-cls';
import axios from 'axios';
import {UsersEntity} from '../entities/users.entity.js';
import {UserThirdPartyEntity} from '../entities/user-third-party.entity.js';
import {LoginRequestDto} from '../dto/request/login.request.dto.js';
import {RefreshTokenRequestDto} from '../dto/request/refreshToken.request.dto.js';
import {RegisterRequestDto} from '../dto/request/register.request.dto.js';
import {ThirdPartyProvider} from '../enums/third-party-provider.enum.js';
import {GithubLoginResponseVo} from "../dto/vo/github.login.response.vo.js";
import {CommonConstants} from "../../../common/constants/common.constants.js";
import {TokenService} from "../../module_common/token/service/token.service.js";
import {LoginResponseDto} from "../dto/response/login.response.dto.js";
import {UserInfoResponseDto} from "../dto/response/user.info.response.dto.js";
import {CurrentUserUtil} from "../../../common/utils/current-user.util.js";
import {Gender} from "../enums/user.gender.enum.js";
import {Repository} from "typeorm";
import {RedisService} from "../../module_common/redis/service/redis.service.js";
import {randomBytes} from "node:crypto";

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
        private readonly clsStoreClsService: ClsService,
        private readonly redisService: RedisService,
    ) {
    }

    async userLogin(dto: LoginRequestDto) {
        this.logger.log(`userLogin() - dto=${JSON.stringify(dto)}`);
        return undefined;
    }

    async refreshToken(dto: RefreshTokenRequestDto) {
        this.logger.log(`refreshToken() - dto=${JSON.stringify(dto)}`);
        return undefined;
    }

    async logout() {
        const currentUserId = CurrentUserUtil.getCurrentUserId();
        this.logger.log(`logout() - currentUserId=${currentUserId}`);
        const accessTokenKey = `${CommonConstants.CACHE_KEY.USER_ACCESS_TOKEN}${currentUserId}`;
        const refreshTokenKey = `${CommonConstants.CACHE_KEY.USER_ACCESS_TOKEN}${currentUserId}`;
        await this.redisService.del(accessTokenKey, refreshTokenKey)
        this.logger.log(`logout() - 已删除 token key: ${accessTokenKey}`);
    }

    async register(dto: RegisterRequestDto) {
        this.logger.log(`register() - dto=${JSON.stringify(dto)}`);
        return undefined;
    }

    async loginGithubUrl(): Promise<string> {
        this.logger.log(`loginGithubUrl() - 开始构建 GitHub 授权 URL`);
        const params = new URLSearchParams({
            client_id: this.configService.get<string>('GITHUB_CLIENT_ID')!,
            redirect_uri: this.configService.get<string>('GITHUB_CALLBACK_URL')!,
            scope: 'read:user user:email',
        });
        const url = `https://github.com/login/oauth/authorize?${params}`;
        this.logger.log(`loginGithubUrl() - url=${url}`);
        return url;
    }

    async githubLoginCallback(code: string): Promise<LoginResponseDto> {
        this.logger.log(`githubLoginCallback() - code=${code}`);
        const accessToken = await this.getAccessToken(code);
        const profile = await this.getGithubUserInfo(accessToken);
        return await this.verifyAndCreateUserInfo(profile);
    }

    private async getAccessToken(code: string): Promise<string> {
        this.logger.log(`getAccessToken() - code=${code}`);
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
            this.logger.error(`getAccessToken() - GitHub token 交换失败: ${JSON.stringify(response.data)}`);
            throw new Error(`GitHub token 交换失败`);
        }
        this.logger.log(`getAccessToken() - 成功获取 access_token`);
        return response.data.access_token;
    }

    private async getGithubUserInfo(accessToken: string): Promise<GithubLoginResponseVo> {
        this.logger.log(`getGithubUserInfo() - 开始获取 GitHub 用户信息`);
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
                this.logger.warn('getGithubUserInfo() - 获取 GitHub 邮箱失败，用户可能未授权 user:email');
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
        this.logger.log(`getGithubUserInfo() - 获取成功, username=${githubLoginResponseVo.username}, email=${email}`);
        return githubLoginResponseVo;
    }

    private async verifyAndCreateUserInfo(profile: GithubLoginResponseVo): Promise<LoginResponseDto> {
        this.logger.log(`verifyAndCreateUserInfo() - openId=${profile.id}, username=${profile.username}`);
        const userThirdPartyEntity = await this.thirdPartyRepository.findOne({
            where: {provider: ThirdPartyProvider.GITHUB, openId: profile.id},
            relations: {user: CommonConstants.BOOLEAN.TRUE},
        });
        if (userThirdPartyEntity && userThirdPartyEntity.user) {
            this.logger.log(`verifyAndCreateUserInfo() - 用户已存在, userId=${userThirdPartyEntity.user.id}, 直接签发 token`);
            return this.tokenService.createToken(userThirdPartyEntity.user.id);
        }
        this.logger.log(`verifyAndCreateUserInfo() - 新用户，开始创建用户`);
        const newUserEntity = new UsersEntity();
        newUserEntity.nickName = profile.displayName;
        newUserEntity.avatarUrl = profile.avatar;
        newUserEntity.signature = profile.profileUrl;
        newUserEntity.email = profile.email;
        newUserEntity.lastLoginIp = this.clsStoreClsService.get<string>(CommonConstants.IP) ?? '';
        newUserEntity.lastLoginAt = new Date();
        const usersEntity = await this.userRepository.save(newUserEntity);
        this.logger.log(`verifyAndCreateUserInfo() - 用户创建成功, userId=${usersEntity.id}`);
        const newUserThirdPartyEntity = new UserThirdPartyEntity();
        newUserThirdPartyEntity.user = usersEntity;
        newUserThirdPartyEntity.username = profile.username;
        newUserThirdPartyEntity.email = profile.email;
        newUserThirdPartyEntity.userId = usersEntity.id
        newUserThirdPartyEntity.avatar = profile.avatar;
        newUserThirdPartyEntity.provider = ThirdPartyProvider.GITHUB;
        newUserThirdPartyEntity.rawData = JSON.stringify(profile.raw);
        newUserThirdPartyEntity.openId = profile.id;
        newUserThirdPartyEntity.boundAt = new Date();
        await this.thirdPartyRepository.save(newUserThirdPartyEntity);
        this.logger.log(`verifyAndCreateUserInfo() - 第三方账号绑定成功, openId=${profile.id}`);
        return this.tokenService.createToken(usersEntity.id);
    }

    async getUserInfo(): Promise<UserInfoResponseDto> {
        const currentUserId = CurrentUserUtil.getCurrentUserId();
        this.logger.log(`getUserInfo() - currentUserId=${currentUserId}`);
        const userInfoResponseDto = new UserInfoResponseDto();
        const userThirdPartyEntity = await this.thirdPartyRepository.findOne({
            where: {provider: ThirdPartyProvider.GITHUB, openId: currentUserId},
            relations: {user: CommonConstants.BOOLEAN.TRUE},
        });
        if (userThirdPartyEntity && userThirdPartyEntity.user) {
            userInfoResponseDto.avatar = userThirdPartyEntity?.avatar ?? null;
            userInfoResponseDto.email = userThirdPartyEntity?.email ?? null;
            userInfoResponseDto.username = userThirdPartyEntity?.username ?? null;
            userInfoResponseDto.provider = ThirdPartyProvider.GITHUB;
            userInfoResponseDto.gender = userThirdPartyEntity?.user?.gender ?? Gender.UNKNOWN;
            userInfoResponseDto.signature = userThirdPartyEntity?.user.signature ?? null;
            userInfoResponseDto.nickname = userThirdPartyEntity?.user.nickName ?? null;
            this.logger.log(`getUserInfo() - 查询到用户信息, username=${userInfoResponseDto.username}`);
        } else {
            this.logger.warn(`getUserInfo() - 未找到第三方绑定信息, currentUserId=${currentUserId}`);
        }
        return userInfoResponseDto;
    }

    async getCodeToGetToken(loginResponseDto: LoginResponseDto) {
        this.logger.log(`getCodeToGetToken() - 开始生成一次性 code`);
        const toString = randomBytes(32).toString('hex');
        const key = `${CommonConstants.CACHE_KEY.USER_GET_CODE}${toString}`;
        const loginResultStr = JSON.stringify(loginResponseDto);
        await this.redisService.set(key, loginResultStr, 3600);
        this.logger.log(`getCodeToGetToken() - code=${toString}, 已写入 Redis`);
        return toString;
    }

    async getToken(code: string): Promise<any> {
        this.logger.log(`getToken() - code=${code}`);
        const key = `${CommonConstants.CACHE_KEY.USER_ACCESS_TOKEN}${code}`;
        const raw = (await this.redisService.getClient().eval(
            `local
            v = redis.call('GET', KEYS[1])
            if (v) then
            redis.call('DEL', KEYS[1])
            end
            return v`,
            1,
            key,
        )) as string | null;
        if (!raw) {
            this.logger.warn(`getToken() - code 无效或已过期, code=${code}`);
            throw new Error('code 无效或已过期');
        }
        this.logger.log(`getToken() - code 校验成功, 返回 token 数据`);
        return JSON.parse(raw);
    }
}
