import {ApiProperty} from "@nestjs/swagger";
import {BaseEntity} from "../../../common/entities/base.entity.js";
import {Column, Entity, Index} from "typeorm";
import {UserConstants} from "../constants/user.constants.js";
import {Gender} from "../enums/user.gender.enum.js";
import {CommonConstants} from "../../../common/constants/common.constants.js";

@Entity(UserConstants.USER.TABLE_NAME)
@Index('idx_nick_name_email', ['nickName', 'email'])
@Index('idx_last_login_at_ip', ['lastLoginAt', 'lastLoginIp'])
export class UsersEntity extends BaseEntity {

    @ApiProperty({description: '用户昵称', example: 'user_1001'})
    @Index()
    @Column({
        name: UserConstants.USER.COLUMN.NICK_NAME,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.USER.LENGTH.NICK_NAME
    })
    nickName: string | null;

    @ApiProperty({description: '用户密码（前端传来加密密码，然后再经过sha256加盐后存入数据库）'})
    @Column({
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.USER.LENGTH.PASSWORD,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    password: string;

    @ApiProperty({
        description: '用户最后一次登录的 IP 地址',
        example: '127.0.0.1',
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.USER.COLUMN.LAST_LOGIN_IP,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.USER.LENGTH.LAST_LOGIN_IP,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    lastLoginIp: string | null;

    @ApiProperty({
        description: '用户最后一次登录时间',
        example: '2025-01-15T10:30:00Z',
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.USER.COLUMN.LAST_LOGIN_AT,
        type: CommonConstants.TYPE.DATE,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    lastLoginAt: Date | null;

    @ApiProperty({description: '用户登录邮箱', example: '...@example.com'})
    @Index()
    @Column({
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.USER.LENGTH.EMAIL,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    email: string| null;

    @ApiProperty({description: '用户头像url', example: ''})
    @Column({
        name: UserConstants.USER.COLUMN.AVATAR_URL,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.USER.LENGTH.AVATAR_URL,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    avatarUrl: string | null;

    @ApiProperty({
        description: '连续登录失败次数',
        example: 0,
        default: 0,
    })
    @Column({
        name: UserConstants.USER.COLUMN.LOGIN_FAIL_COUNT,
        type: CommonConstants.TYPE.INT,
        default: UserConstants.USER.DEFAULT.LOGIN_FAIL_COUNT
    })
    loginFailCount: number;

    @ApiProperty({
        description: '账户锁定到期时间（为空表示未锁定）',
        example: '2025-01-15T10:30:00Z',
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.USER.COLUMN.LOCKED_UNTIL,
        type: CommonConstants.TYPE.DATE,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    lockedUntil: Date | null;

    @ApiProperty({
        description: '性别：0未知 1男 2女',
        enum: Gender,
        example: Gender.UNKNOWN,
        default: Gender.UNKNOWN,
    })
    @Column({name: UserConstants.USER.COLUMN.GENDER, type: CommonConstants.TYPE.TINYINT, default: Gender.UNKNOWN})
    gender: Gender;

    @ApiProperty({
        description: '生日',
        example: '1995-08-20',
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.USER.COLUMN.BIRTHDAY,
        type: CommonConstants.TYPE.DATE,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    birthday: Date | null;

    @ApiProperty({
        description: '个人签名/简介',
        example: '这个人很懒，什么都没留下',
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.USER.COLUMN.SIGNATURE,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.USER.LENGTH.SIGNATURE,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    signature: string | null;
}
