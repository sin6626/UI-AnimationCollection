import {Injectable, Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
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
        private readonly configService: ConfigService,
    ) {
    }

    async kommentareAbrufen(kommentarUrl: string | undefined) {
        if (kommentarUrl) {
            return [] as KommentareEntity[];
        }
        return await this.kommentareEntityRepository.find({
            where: {kommentarUrl: kommentarUrl},
            relations: {autor: CommonConstants.BOOLEAN.TRUE},
        });
    }

    async kommentieren(kommentarUrl: string | undefined, kommentierenRequestDto: KommentierenRequestDto) {
        if (!kommentarUrl) {
            return new KommentareEntity();
        }
        const kommentareEntity = new KommentareEntity();
        kommentareEntity.kommentarUrl = kommentarUrl;
        if (kommentierenRequestDto.parent_id) {
            kommentareEntity.parentId = kommentierenRequestDto.parent_id;
        }
        const currentUserId = CurrentUserUtil.getCurrentUserId();
        const currentUser = await this.usersEntityRepository.findOne({
            where: {id: currentUserId},
        });
        kommentareEntity.autor = currentUser;
        kommentareEntity.autorId = currentUserId;
        kommentareEntity.autorName = currentUser?.nickName;
        kommentareEntity.likes = 0;
        kommentareEntity.inhalt = kommentierenRequestDto.inhalt;
        kommentareEntity.zielId = kommentarUrl;
        kommentareEntity.zielTyp = ZielTyp.ARTIKEL;
        await this.kommentareEntityRepository.save(kommentareEntity);
    }

    async like(id: string): Promise<KommentareEntity> {
        if (!id) throw BusinessException.PARAMETER_IS_EMPTY;
        const kommentar = await this.kommentareEntityRepository.findOne({
            where: { id: id },
        });
        if (!kommentar) throw BusinessException.PARAMETER_IS_EMPTY;
        kommentar.likes = (kommentar.likes ?? 0) + 1;
        return await this.kommentareEntityRepository.save(kommentar);
    }

    async cancelLike(id: string): Promise<KommentareEntity> {
        if (!id) throw BusinessException.PARAMETER_IS_EMPTY;
        const kommentar = await this.kommentareEntityRepository.findOne({
            where: { id: id },
        });
        if (!kommentar) throw BusinessException.PARAMETER_IS_EMPTY;
        kommentar.likes = (kommentar.likes ?? 0) - 1;
        return await this.kommentareEntityRepository.save(kommentar);
    }
}
