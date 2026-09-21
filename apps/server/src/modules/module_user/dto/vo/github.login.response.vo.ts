import { ApiProperty } from '@nestjs/swagger';

export class GithubLoginResponseVo {
    @ApiProperty({ description: 'GitHub 用户唯一 ID' })
    id: string;

    @ApiProperty({ description: 'GitHub 用户名（login）' })
    username: string;

    @ApiProperty({ description: 'GitHub 显示名', nullable: true })
    displayName: string | null;

    @ApiProperty({ description: 'GitHub 头像 URL', nullable: true })
    avatar: string | null;

    @ApiProperty({ description: 'GitHub 主页链接', nullable: true })
    profileUrl: string | null;

    @ApiProperty({ description: 'GitHub 邮箱', nullable: true })
    email: string | null;

    @ApiProperty({ description: 'GitHub 原始数据', nullable: true })
    raw: Record<string, any> | null;
}
