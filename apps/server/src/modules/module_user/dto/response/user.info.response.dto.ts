import {ThirdPartyProvider} from "../../enums/third-party-provider.enum.js";
import {Gender} from "../../enums/user.gender.enum.js";

import {ApiProperty} from '@nestjs/swagger';

export class UserInfoResponseDto {
    @ApiProperty({description: '用户昵称', nullable: true, example: '张三'})
    nickname: string | null;

    @ApiProperty({description: '用户头像地址', nullable: true, example: 'https://example.com/avatar.png'})
    avatar: string | null;

    @ApiProperty({description: '用户邮箱', nullable: true, example: 'user@example.com'})
    email: string | null;

    @ApiProperty({description: '用户名', nullable: true, example: 'zhangsan'})
    username: string | null;

    @ApiProperty({
        description: '第三方登录提供方',
        enum: ThirdPartyProvider,
        example: ThirdPartyProvider.GITHUB,
    })
    provider: ThirdPartyProvider;

    @ApiProperty({description: '个性签名', nullable: true, example: '这个人很懒，什么都没留下'})
    signature: string | null;

    @ApiProperty({
        description: '性别',
        enum: Gender,
        example: Gender.UNKNOWN,
    })
    gender: Gender;
}
