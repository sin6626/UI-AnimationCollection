/**
 * 数据库相关常量
 */
export class DatabaseConstants {

    /** ========== 通用列名 ========== */
    static readonly COLUMN = {
        ID: 'id',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
        DELETED_AT: 'deleted_at',
        CREATED_BY: 'created_by',
        UPDATED_BY: 'updated_by',
        DELETED_BY: 'deleted_by',
    } as const;

    /** ========== 通用描述 ========== */
    static readonly DESC = {
        ID: '主键 ID（雪花算法）',
        CREATED_AT: '创建时间',
        UPDATED_AT: '更新时间',
        DELETED_AT: '逻辑删除时间，null 表示未删除',
        CREATED_BY: '创建人 ID',
        UPDATED_BY: '最后更新人 ID',
        DELETED_BY: '删除人 ID',
    } as const;

    /** ========== 通用示例值 ========== */
    static readonly EXAMPLE = {
        ID: '1234567890123456789',
        DATETIME: '2026-09-18T08:00:00.000Z',
        NULL: null,
    } as const;

    /** ========== 数字类型（int） ========== */
    static readonly INT = {
        MIN: -2147483648,
        MAX: 2147483647,
    } as const;

    /** ========== 长整型（long / bigint） ========== */
    static readonly LONG = {
        MIN: -9223372036854775808n,
        MAX: 9223372036854775807n,
    } as const;

    /** ========== 字节（byte） ========== */
    static readonly BYTE = {
        MIN: -128,
        MAX: 127,
    } as const;

    /** ========== 短整型（short） ========== */
    static readonly SHORT = {
        MIN: -32768,
        MAX: 32767,
    } as const;

    /** ========== 无符号字节（unsigned byte） ========== */
    static readonly UNSIGNED_BYTE = {
        MIN: 0,
        MAX: 255,
    } as const;

    /** ========== 无符号短整型（unsigned short） ========== */
    static readonly UNSIGNED_SHORT = {
        MIN: 0,
        MAX: 65535,
    } as const;

    /** ========== 无符号整型（unsigned int） ========== */
    static readonly UNSIGNED_INT = {
        MIN: 0,
        MAX: 4294967295,
    } as const;
}
