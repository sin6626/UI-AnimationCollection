import {ApiProperty} from '@nestjs/swagger';
import {Column, Entity, Index, ManyToOne, JoinColumn} from 'typeorm';
import {BaseEntity} from '../../../common/entities/base.entity.js';
import {CommonConstants} from '../../../common/constants/common.constants.js';
import {ZielTyp} from '../enums/ziel-typ.enum.js';
import {KommentarConstants} from '../constants/kommentar.constants.js';
import {UsersEntity} from '../../module_user/entities/users.entity.js';

@Entity(KommentarConstants.KOMMENTAR.TABLE_NAME)
@Index(KommentarConstants.KOMMENTAR.INDEX.UK_KOMMENTAR_URL, ['kommentarUrl'], {unique: true})
@Index(KommentarConstants.KOMMENTAR.INDEX.IDX_AUTOR_ID, ['autorId'])
@Index(KommentarConstants.KOMMENTAR.INDEX.IDX_ZIEL, ['zielId', 'zielTyp'])
@Index(KommentarConstants.KOMMENTAR.INDEX.IDX_PARENT_ID, ['parentId'])
export class KommentareEntity extends BaseEntity {

    @ApiProperty({description: '评论 URL（唯一标识）'})
    @Column({
        name: KommentarConstants.KOMMENTAR.COLUMN.KOMMENTAR_URL,
        type: CommonConstants.TYPE.VARCHAR,
        length: KommentarConstants.KOMMENTAR.LENGTH.KOMMENTAR_URL,
    })
    kommentarUrl: string;

    @ApiProperty({description: '评论内容'})
    @Column({
        name: KommentarConstants.KOMMENTAR.COLUMN.INHALT,
        type: CommonConstants.TYPE.TEXT,
    })
    inhalt: string;

    @ApiProperty({description: '作者 ID'})
    @Column({
        name: KommentarConstants.KOMMENTAR.COLUMN.AUTOR_ID,
        type: CommonConstants.TYPE.INT,
    })
    autorId: string | undefined;

    @ApiProperty({description: '作者名称', nullable: true})
    @Column({
        name: KommentarConstants.KOMMENTAR.COLUMN.AUTOR_NAME,
        type: CommonConstants.TYPE.VARCHAR,
        length: KommentarConstants.KOMMENTAR.LENGTH.AUTOR_NAME,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    autorName: string | null | undefined;

    @ApiProperty({description: '目标 ID（文章/帖子等）'})
    @Column({
        name: KommentarConstants.KOMMENTAR.COLUMN.ZIEL_ID,
        type: CommonConstants.TYPE.INT,
    })
    zielId: string;

    @ApiProperty({
        description: '目标类型',
        enum: ZielTyp,
        example: ZielTyp.ARTIKEL,
    })
    @Column({
        name: KommentarConstants.KOMMENTAR.COLUMN.ZIEL_TYP,
        type: CommonConstants.TYPE.VARCHAR,
        length: KommentarConstants.KOMMENTAR.LENGTH.ZIEL_TYP,
    })
    zielTyp: ZielTyp;

    @ApiProperty({description: '父评论 ID（回复用）', nullable: true})
    @Column({
        name: KommentarConstants.KOMMENTAR.COLUMN.PARENT_ID,
        type: CommonConstants.TYPE.INT,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    parentId: string | null;

    @ApiProperty({description: '点赞数', default: 0})
    @Column({
        name: KommentarConstants.KOMMENTAR.COLUMN.LIKES,
        type: CommonConstants.TYPE.INT,
        default: 0,
    })
    likes: number;

    @ManyToOne(() => UsersEntity)
    @JoinColumn({name: KommentarConstants.KOMMENTAR.COLUMN.AUTOR_ID})
    autor: UsersEntity | null;
}
