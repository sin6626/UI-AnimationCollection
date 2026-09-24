import {ApiProperty} from '@nestjs/swagger';
import {Column, Entity, Index, ManyToOne, JoinColumn} from 'typeorm';
import {BaseEntity} from '../../../common/entities/base.entity.js';
import {CommonConstants} from '../../../common/constants/common.constants.js';
import {UserConstants} from '../constants/user.constants.js';
import {ThirdPartyProvider} from '../enums/third-party-provider.enum.js';
import {UsersEntity} from './users.entity.js';

@Entity(UserConstants.THIRD_PARTY.TABLE_NAME)
@Index('uk_provider_open_id', ['provider', 'openId'], {unique: true})
@Index('idx_user_id', ['userId'])
export class UserThirdPartyEntity extends BaseEntity {

    @ApiProperty({description: '关联的本地用户 ID'})
    @Column({
        name: UserConstants.THIRD_PARTY.COLUMN.USER_ID,
        type: CommonConstants.TYPE.INT,
    })
    userId: string;

    @ApiProperty({
        description: '第三方平台',
        enum: ThirdPartyProvider,
        example: ThirdPartyProvider.GITHUB,
    })
    @Column({
        name: UserConstants.THIRD_PARTY.COLUMN.PROVIDER,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.THIRD_PARTY.LENGTH.PROVIDER,
    })
    provider: ThirdPartyProvider;

    @ApiProperty({description: '第三方平台的用户唯一标识'})
    @Column({
        name: UserConstants.THIRD_PARTY.COLUMN.OPEN_ID,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.THIRD_PARTY.LENGTH.OPEN_ID,
    })
    openId: string;

    @ApiProperty({description: '第三方平台的用户名', nullable: true})
    @Column({
        name: UserConstants.THIRD_PARTY.COLUMN.USERNAME,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.THIRD_PARTY.LENGTH.USERNAME,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    username: string | null;

    @ApiProperty({description: '第三方平台的昵称', nullable: true})
    @Column({
        name: UserConstants.THIRD_PARTY.COLUMN.NICKNAME,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.THIRD_PARTY.LENGTH.NICKNAME,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    nickname: string | null;

    @ApiProperty({description: '第三方平台的头像', nullable: true})
    @Column({
        name: UserConstants.THIRD_PARTY.COLUMN.AVATAR,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.THIRD_PARTY.LENGTH.AVATAR,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    avatar: string | null;

    @ApiProperty({description: '第三方平台返回的邮箱', nullable: true})
    @Column({
        name: UserConstants.THIRD_PARTY.COLUMN.EMAIL,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.THIRD_PARTY.LENGTH.EMAIL,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    email: string | null;

    @ApiProperty({description: '第三方原始数据（JSON）', nullable: true})
    @Column({
        name: UserConstants.THIRD_PARTY.COLUMN.RAW_DATA,
        type: CommonConstants.TYPE.TEXT,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    rawData: string | null;

    @ApiProperty({description: '首次绑定时间', nullable: true})
    @Column({
        name: UserConstants.THIRD_PARTY.COLUMN.BOUND_AT,
        type: CommonConstants.TYPE.DATE,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    boundAt: Date | null;

    @ManyToOne(() => UsersEntity)
    @JoinColumn({name: UserConstants.THIRD_PARTY.COLUMN.USER_ID})
    user: UsersEntity;
}
