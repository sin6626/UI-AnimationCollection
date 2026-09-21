import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({ description: '访问令牌（Access Token）', example: 'eyJhbGciOiJIUzI1NiIs...' })
    accessToken: string;

    @ApiProperty({ description: '刷新令牌（Refresh Token）', example: 'eyJhbGciOiJIUzI1NiIs...' })
    refreshToken: string;

    @ApiProperty({ description: '访问令牌类型', example: 'Bearer', default: 'Bearer' })
    tokenType: string;

    @ApiProperty({ description: '访问令牌过期时间（秒）', example: 3600 })
    expiresIn: number;

    @ApiProperty({ description: '访问令牌过期时间戳（毫秒）', example: 1758441600000 })
    expiresAt: number;

    @ApiProperty({ description: '刷新令牌过期时间（秒）', example: 604800 })
    refreshExpiresIn: number;

    @ApiProperty({ description: '刷新令牌过期时间戳（毫秒）', example: 1759046400000 })
    refreshExpiresAt: number;
}
