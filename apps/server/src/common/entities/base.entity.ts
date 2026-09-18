import { ApiProperty } from '@nestjs/swagger';
import {
    PrimaryColumn,
    BeforeInsert,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Column,
} from 'typeorm';
import { generateSnowflakeId } from '../utils/snowflake.util.js';

export abstract class BaseEntity {
    @ApiProperty({
        description: '主键 ID（雪花算法）',
        example: '1234567890123456789',
    })
    @PrimaryColumn({ type: 'bigint' })
    id: string;

    @ApiProperty({
        description: '创建时间',
        example: '2026-09-18T08:00:00.000Z',
    })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({
        description: '更新时间',
        example: '2026-09-18T09:30:00.000Z',
    })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ApiProperty({
        description: '逻辑删除时间，null 表示未删除',
        required: false,
        example: null,
    })
    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date | null;

    @ApiProperty({
        description: '创建人 ID',
        required: false,
        example: '1234567890123456789',
    })
    @Column({ name: 'created_by', type: 'bigint', nullable: true })
    createdBy: string | null;

    @ApiProperty({
        description: '最后更新人 ID',
        required: false,
        example: '1234567890123456789',
    })
    @Column({ name: 'updated_by', type: 'bigint', nullable: true })
    updatedBy: string | null;

    @ApiProperty({
        description: '删除人 ID',
        required: false,
        example: null,
    })
    @Column({ name: 'deleted_by', type: 'bigint', nullable: true })
    deletedBy: string | null;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = generateSnowflakeId();
        }
    }
}
