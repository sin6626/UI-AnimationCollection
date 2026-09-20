import {ApiProperty} from "@nestjs/swagger";
import {BaseEntity} from "../../../common/entities/base.entity.js";
import {Column, Entity, Index} from "typeorm";
import {UserConstants} from "../constants/user.constants.js"
import {Gender} from "../enums/user.gender.enum.js";
import {CommonConstants} from "../../../common/constants/common.constants.js"


@Entity(UserConstants.TABLE_NAME)
@Index('idx_nick_name_email', ['nickName', 'email'])
@Index('idx_last_login_at_ip', ['lastLoginAt', 'lastLoginIp'])
export class UsersEntity extends BaseEntity {

    @ApiProperty({description: UserConstants.DESC.NICK_NAME, example: UserConstants.EXAMPLE.NICK_NAME})
    @Index()
    @Column({
        name: UserConstants.COLUMN.NICK_NAME,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.LENGTH.NICK_NAME
    })
    nickName: string;

    @ApiProperty({description: UserConstants.DESC.PASSWORD})
    @Column({type: CommonConstants.TYPE.VARCHAR, length: UserConstants.LENGTH.PASSWORD})
    password: string;

    @ApiProperty({
        description: UserConstants.DESC.LAST_LOGIN_IP,
        example: UserConstants.EXAMPLE.LAST_LOGIN_IP,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.COLUMN.LAST_LOGIN_IP,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.LENGTH.LAST_LOGIN_IP,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    lastLoginIp: string | null;

    @ApiProperty({
        description: UserConstants.DESC.LAST_LOGIN_AT,
        example: UserConstants.EXAMPLE.DATETIME,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.COLUMN.LAST_LOGIN_AT,
        type: CommonConstants.TYPE.DATE,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    lastLoginAt: Date | null;

    @ApiProperty({description: UserConstants.DESC.EMAIL, example: UserConstants.EXAMPLE.EMAIL})
    @Index()
    @Column({type: CommonConstants.TYPE.VARCHAR, length: UserConstants.LENGTH.EMAIL})
    email: string;

    @ApiProperty({description: UserConstants.DESC.AVATAR_URL, example: UserConstants.EXAMPLE.AVATAR_URL})
    @Column({
        name: UserConstants.COLUMN.AVATAR_URL,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.LENGTH.AVATAR_URL,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    avatarUrl: string;

    @ApiProperty({
        description: UserConstants.DESC.LOGIN_FAIL_COUNT,
        example: UserConstants.EXAMPLE.LOGIN_FAIL_COUNT,
        default: UserConstants.DEFAULT.LOGIN_FAIL_COUNT,
    })
    @Column({
        name: UserConstants.COLUMN.LOGIN_FAIL_COUNT,
        type: CommonConstants.TYPE.INT,
        default: UserConstants.DEFAULT.LOGIN_FAIL_COUNT
    })
    loginFailCount: number;

    @ApiProperty({
        description: UserConstants.DESC.LOCKED_UNTIL,
        example: UserConstants.EXAMPLE.DATETIME,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.COLUMN.LOCKED_UNTIL,
        type: CommonConstants.TYPE.DATE,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    lockedUntil: Date | null;


    @ApiProperty({
        description: UserConstants.DESC.GENDER,
        enum: Gender,
        example: Gender.UNKNOWN,
        default: Gender.UNKNOWN,
    })
    @Column({name: UserConstants.COLUMN.GENDER, type: CommonConstants.TYPE.TINYINT, default: Gender.UNKNOWN})
    gender: Gender;

    @ApiProperty({
        description: UserConstants.DESC.BIRTHDAY,
        example: UserConstants.EXAMPLE.BIRTHDAY,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.COLUMN.BIRTHDAY,
        type: CommonConstants.TYPE.DATE,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    birthday: Date | null;

    @ApiProperty({
        description: UserConstants.DESC.SIGNATURE,
        example: UserConstants.EXAMPLE.SIGNATURE,
        nullable: CommonConstants.BOOLEAN.TRUE,
    })
    @Column({
        name: UserConstants.COLUMN.SIGNATURE,
        type: CommonConstants.TYPE.VARCHAR,
        length: UserConstants.LENGTH.SIGNATURE, nullable: CommonConstants.BOOLEAN.TRUE
    })
    signature: string | null;

}
