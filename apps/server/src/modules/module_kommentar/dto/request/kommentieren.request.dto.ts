import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class KommentierenRequestDto {
    @ApiProperty({ description: '评论内容' })
    @IsString()
    @IsNotEmpty()
    inhalt: string;

    @ApiProperty({ description: '父评论ID', required: false })
    @IsOptional()
    @IsString()
    parent_id?: string;
}
