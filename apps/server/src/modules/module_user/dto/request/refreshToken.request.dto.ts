import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString} from "class-validator";

export class RefreshTokenRequestDto {

    @ApiProperty({ description: '刷新token', example: 'xxxxxx' })
    @IsString()
    @IsNotEmpty({ message: '刷新token不能为空' })
    refreshTokenRequestDto: string;
}
