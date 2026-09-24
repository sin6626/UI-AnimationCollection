import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {KommentareEntity} from "../entities/kommentare.entity.js";
import {CommonConstants} from "../../../common/constants/common.constants.js";
import {CurrentUserUtil} from "../../../common/utils/current-user.util.js";
import {UsersEntity} from "../../module_user/entities/users.entity.js";
import {ZielTyp} from "../enums/ziel-typ.enum.js";
import {KommentierenRequestDto} from "../dto/request/kommentieren.request.dto.js";
import {BusinessException} from "../../../common/exceptions/business.exception.js";

@Injectable()
export class KommentarService {
    private readonly logger = new Logger(KommentarService.name);

    constructor(
        @InjectRepository(KommentareEntity)
        private readonly kommentareEntityRepository: Repository<KommentareEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersEntityRepository: Repository<UsersEntity>,
    ) {
    }

    async kommentareAbrufen(kommentarUrl: string | undefined) {
        this.logger.log(`kommentareAbrufen() - kommentarUrl=${kommentarUrl}`);
        if (kommentarUrl) {
            this.logger.warn(`kommentarUrl 无效（truthy），返回空数组`);
            return [] as KommentareEntity[];
        }
        const result = await this.kommentareEntityRepository.find({
            where: {kommentarUrl: kommentarUrl},
            relations: {autor: CommonConstants.BOOLEAN.TRUE},
        });
        this.logger.log(`kommentareAbrufen() - 查询到 ${result.length} 条评论`);
        return result;
    }

    async kommentieren(kommentarUrl: string | undefined, kommentierenRequestDto: KommentierenRequestDto) {
        this.logger.log(`kommentieren() - kommentarUrl=${kommentarUrl}, dto=${JSON.stringify(kommentierenRequestDto)}`);
        if (!kommentarUrl) {
            this.logger.warn(`kommentarUrl 为空，返回空 KommentareEntity`);
            return new KommentareEntity();
        }
        const kommentareEntity = new KommentareEntity();
        kommentareEntity.kommentarUrl = kommentarUrl;
        if (kommentierenRequestDto.parent_id) {
            kommentareEntity.parentId = kommentierenRequestDto.parent_id;
            this.logger.log(`回复评论，parent_id=${kommentierenRequestDto.parent_id}`);
        }
        const currentUserId = CurrentUserUtil.getCurrentUserId();
        this.logger.log(`当前用户ID currentUserId=${currentUserId}`);
        const currentUser = await this.usersEntityRepository.findOne({
            where: {id: currentUserId},
        });
        if (!currentUser) {
            this.logger.warn(`未找到用户，currentUserId=${currentUserId}`);
        }
        kommentareEntity.autor = currentUser;
        kommentareEntity.autorId = currentUserId;
        kommentareEntity.autorName = currentUser?.nickName;
        kommentareEntity.likes = 0;
        kommentareEntity.inhalt = kommentierenRequestDto.inhalt;
        kommentareEntity.zielId = kommentarUrl;
        kommentareEntity.zielTyp = ZielTyp.ARTIKEL;
        const saved = await this.kommentareEntityRepository.save(kommentareEntity);
        this.logger.log(`评论保存成功，id=${saved.id}`);
        return saved;
    }

    async like(id: string): Promise<KommentareEntity> {
        this.logger.log(`like() - id=${id}`);
        if (!id) {
            this.logger.warn(`like() - id 为空，抛出 PARAMETER_IS_EMPTY`);
            throw BusinessException.PARAMETER_IS_EMPTY;
        }
        const kommentar = await this.kommentareEntityRepository.findOne({
            where: {id: id},
        });
        if (!kommentar) {
            this.logger.warn(`like() - 评论不存在，id=${id}`);
            throw BusinessException.PARAMETER_IS_EMPTY;
        }
        kommentar.likes = (kommentar.likes ?? 0) + 1;
        const saved = await this.kommentareEntityRepository.save(kommentar);
        this.logger.log(`like() - 点赞成功，id=${id}, likes=${saved.likes}`);
        return saved;
    }

    async cancelLike(id: string): Promise<KommentareEntity> {
        this.logger.log(`cancelLike() - id=${id}`);
        if (!id) {
            this.logger.warn(`cancelLike() - id 为空，抛出 PARAMETER_IS_EMPTY`);
            throw BusinessException.PARAMETER_IS_EMPTY;
        }
        const kommentar = await this.kommentareEntityRepository.findOne({
            where: {id: id},
        });
        if (!kommentar) {
            this.logger.warn(`cancelLike() - 评论不存在，id=${id}`);
            throw BusinessException.PARAMETER_IS_EMPTY;
        }
        kommentar.likes = (kommentar.likes ?? 0) - 1;
        const saved = await this.kommentareEntityRepository.save(kommentar);
        this.logger.log(`cancelLike() - 取消点赞成功，id=${id}, likes=${saved.likes}`);
        return saved;
    }
}
