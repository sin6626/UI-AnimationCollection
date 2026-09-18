import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('request_logs')
export class RequestLogs extends BaseEntity {
    @ApiProperty({ description: 'HTTP 方法', example: 'GET' })
    @Index()
    @Column({ type: 'varchar', length: 10 })
    method: string;

    @ApiProperty({ description: '请求路径', example: '/animations' })
    @Column({ type: 'varchar', length: 500 })
    url: string;

    @ApiProperty({ description: '客户端 IP', example: '127.0.0.1', required: false })
    @Column({ type: 'varchar', length: 50, nullable: true })
    ip: string | null;

    @ApiProperty({ description: 'User-Agent', required: false })
    @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
    userAgent: string | null;

    @ApiProperty({ description: 'HTTP 状态码', example: 200, required: false })
    @Index()
    @Column({ name: 'status_code', type: 'int', nullable: true })
    statusCode: number | null;

    @ApiProperty({ description: '响应耗时（毫秒）', example: 15, required: false })
    @Column({ name: 'response_time', type: 'int', nullable: true })
    responseTime: number | null;

    @ApiProperty({ description: '用户 ID', required: false, example: '1234567890123456789' })
    @Index()
    @Column({ name: 'user_id', type: 'bigint', nullable: true })
    userId: string | null;
}
