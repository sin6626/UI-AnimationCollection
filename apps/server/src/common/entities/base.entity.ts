import {ApiProperty} from '@nestjs/swagger';
import {
    PrimaryColumn,
    BeforeInsert,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Column,
} from 'typeorm';
import {generateSnowflakeId} from '../utils/snowflake.util.js';
import {DatabaseConstants} from '../constants/database.constants.js';
import {CommonConstants} from "../constants/common.constants.js";


export abstract class BaseEntity {
    @ApiProperty({
        description: DatabaseConstants.DESC.ID,
        example: DatabaseConstants.EXAMPLE.ID,
    })
    @PrimaryColumn({type: CommonConstants.TYPE.BIGINT})
    id: string;

    @ApiProperty({
        description: DatabaseConstants.DESC.CREATED_AT,
        example: DatabaseConstants.EXAMPLE.DATETIME,
    })
    @CreateDateColumn({name: DatabaseConstants.COLUMN.CREATED_AT})
    createdAt: Date;

    @ApiProperty({
        description: DatabaseConstants.DESC.UPDATED_AT,
        example: DatabaseConstants.EXAMPLE.DATETIME,
    })
    @UpdateDateColumn({name: DatabaseConstants.COLUMN.UPDATED_AT})
    updatedAt: Date;

    @ApiProperty({
        description: DatabaseConstants.DESC.DELETED_AT,
        required: CommonConstants.BOOLEAN.FALSE,
        example: DatabaseConstants.EXAMPLE.NULL,
    })
    @DeleteDateColumn({name: DatabaseConstants.COLUMN.DELETED_AT, nullable: CommonConstants.BOOLEAN.TRUE})
    deletedAt: Date | null;

    @ApiProperty({
        description: DatabaseConstants.DESC.CREATED_BY,
        required: CommonConstants.BOOLEAN.FALSE,
        example: DatabaseConstants.EXAMPLE.ID,
    })
    @Column({
        name: DatabaseConstants.COLUMN.CREATED_BY,
        type: CommonConstants.TYPE.BIGINT,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    createdBy: string | null;

    @ApiProperty({
        description: DatabaseConstants.DESC.UPDATED_BY,
        required: CommonConstants.BOOLEAN.FALSE,
        example: DatabaseConstants.EXAMPLE.ID,
    })
    @Column({
        name: DatabaseConstants.COLUMN.UPDATED_BY,
        type: CommonConstants.TYPE.BIGINT,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    updatedBy: string | null;

    @ApiProperty({
        description: DatabaseConstants.DESC.DELETED_BY,
        required: CommonConstants.BOOLEAN.FALSE,
        example: DatabaseConstants.EXAMPLE.NULL,
    })
    @Column({
        name: DatabaseConstants.COLUMN.DELETED_BY,
        type: CommonConstants.TYPE.BIGINT,
        nullable: CommonConstants.BOOLEAN.TRUE
    })
    deletedBy: string | null;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = generateSnowflakeId();
        }
    }
}
