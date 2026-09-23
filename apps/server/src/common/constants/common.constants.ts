/**
 * 系统常用常量
 */
export class CommonConstants {

    static readonly IS_PUBLIC_KEY = 'isPublic';

    static readonly IP = 'ip';

    static readonly CACHE_KEY = {
        USER_ACCESS_TOKEN: 'user_access_token',
        USER_REFRESH_TOKEN: 'user_refresh_token',

    } as const;

    /** ========== 数据库列类型 ========== */
    static readonly TYPE = {
        BIGINT: 'bigint',
        INT: 'int',
        TINYINT: 'tinyint',
        VARCHAR: 'varchar',
        TEXT: 'text',
        DATE: 'date',
        DATETIME: 'datetime',
        TIMESTAMP: 'timestamp',
        BOOLEAN: 'boolean',
    } as const;

    static readonly HEADER = {
        AUTHORIZATION: 'authorization',
        CONTENT_TYPE: 'content-type',
        ACCEPT: 'accept',
        USER_AGENT: 'user-agent',
        X_REQUEST_ID: 'x-request-id',
        X_FORWARDED_FOR: 'x-forwarded-for',
        X_REAL_IP: 'x-real-ip',
    } as const;

    static readonly HTTP_METHOD = {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        PATCH: 'PATCH',
        DELETE: 'DELETE',
        OPTIONS: 'OPTIONS',
        HEAD: 'HEAD',
    } as const;

    static readonly BOOLEAN = {
        TRUE: true,
        FALSE: false,
    } as const;

    static readonly LENGTH = {
        ONE: 1,
        TWO: 2,
        THREE: 3,
        FOUR: 4,
        FIVE: 5,
        SIX: 6,
        SEVEN: 7,
        EIGHT: 8,
        NINE: 9,
        TEN: 10,
    } as const;

    static readonly CONTENT_TYPE = {
        JSON: 'application/json',
        FORM: 'application/x-www-form-urlencoded',
        MULTIPART: 'multipart/form-data',
        TEXT: 'text/plain',
        HTML: 'text/html',
        XML: 'application/xml',
    } as const;

    static readonly AUTH = {
        BEARER: 'Bearer',
        BASIC: 'Basic',
        TOKEN_PREFIX: 'Bearer ',
    } as const;
}
