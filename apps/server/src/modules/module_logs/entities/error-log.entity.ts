import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('error_logs')
@Index(['method', 'url'])
export class ErrorLogs extends BaseEntity {
    @ApiProperty({
        description: '关联的请求日志 ID',
        example: '1234567890123456789',
        required: false,
    })
    @Index()
    @Column({ name: 'request_log_id', type: 'bigint', nullable: true })
    requestLogId: string | null;

    @ApiProperty({ description: 'HTTP 方法', example: 'GET' })
    @Column({ type: 'varchar', length: 10 })
    method: string;

    @ApiProperty({ description: '请求路径', example: '/animations/999' })
    @Column({ type: 'varchar', length: 500 })
    url: string;

    @ApiProperty({ description: 'HTTP 状态码', example: 404 })
    @Index()
    @Column({ name: 'status_code', type: 'int' })
    statusCode: number;

    @ApiProperty({
        description: '业务错误码',
        example: '1000_2001',
        required: false,
    })
    @Index()
    @Column({ name: 'business_code', type: 'varchar', length: 50, nullable: true })
    businessCode: string | null;

    @ApiProperty({
        description: '错误名称',
        example: 'BusinessException',
        required: false,
    })
    @Column({ name: 'error_name', type: 'varchar', length: 100, nullable: true })
    errorName: string | null;

    @ApiProperty({ description: '错误信息', example: '用户不存在' })
    @Column({ name: 'error_message', type: 'text' })
    errorMessage: string;

    @ApiProperty({ description: '错误堆栈', required: false })
    @Column({ name: 'error_stack', type: 'text', nullable: true })
    errorStack: string | null;

    @ApiProperty({ description: '请求体', required: false })
    @Column({ name: 'request_body', type: 'text', nullable: true })
    requestBody: string | null;

    @ApiProperty({ description: '查询参数', required: false })
    @Column({ name: 'query_params', type: 'text', nullable: true })
    queryParams: string | null;

    @ApiProperty({ description: '客户端 IP', required: false })
    @Column({ type: 'varchar', length: 50, nullable: true })
    ip: string | null;

    @ApiProperty({
        description: '用户 ID',
        required: false,
        example: '1234567890123456789',
    })
    @Index()
    @Column({ name: 'user_id', type: 'bigint', nullable: true })
    userId: string | null;
}
