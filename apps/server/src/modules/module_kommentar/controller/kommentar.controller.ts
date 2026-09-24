import {Body, Controller, Get, Param, Post, Req} from "@nestjs/common";
import {KommentarService} from "../service/kommentar.service.js";
import type {Request} from 'express';
import {ApiResultDto} from "../../../common/dto/result/api-result.dto.js";
import {KommentierenRequestDto} from "../dto/request/kommentieren.request.dto.js";

@Controller()
export class KommentarController {

    constructor(
        private readonly kommentarService: KommentarService
    ) {
    }

    @Get('kommentareAbrufen')
    async kommentareAbrufen(@Req() req: Request): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.kommentarService.kommentareAbrufen(req.headers.referer));
    }

    @Post('kommentieren')
    async kommentieren(
        @Req() req: Request,
        @Body() kommentierenRequestDto: KommentierenRequestDto): Promise<ApiResultDto> {
        return ApiResultDto.success(
            await this.kommentarService.kommentieren(req.headers.referer, kommentierenRequestDto)
        );
    }

    @Post('like')
    async like(@Param('id') id: string): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.kommentarService.like(id));
    }

    @Post('cancelLike')
    async cancelLike(@Param('id') id: string): Promise<ApiResultDto> {
        return ApiResultDto.success(await this.kommentarService.cancelLike(id));
    }

}
