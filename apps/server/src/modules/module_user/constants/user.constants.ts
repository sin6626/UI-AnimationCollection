/**
 * 用户模块常量
 */
export class UserConstants {
    /** ========== 表名 ========== */
    static readonly TABLE_NAME = 'users';

    /** ========== 列名 ========== */
    static readonly COLUMN = {
        NICK_NAME: 'nick_name',
        PASSWORD: 'password',
        LAST_LOGIN_IP: 'last_login_ip',
        LAST_LOGIN_AT: 'last_login_at',
        EMAIL: 'email',
        AVATAR_URL: 'avatar_url',
        LOGIN_FAIL_COUNT: 'login_fail_count',
        LOCKED_UNTIL: 'locked_until',
        GENDER: 'gender',
        BIRTHDAY: 'birthday',
        SIGNATURE: 'signature',
    } as const;

    /** ========== 长度 ========== */
    static readonly LENGTH = {
        NICK_NAME: 10,
        PASSWORD: 255,
        LAST_LOGIN_IP: 45,
        EMAIL: 100,
        AVATAR_URL: 200,
        SIGNATURE: 255,
    } as const;

    /** ========== 默认值 ========== */
    static readonly DEFAULT = {
        LOGIN_FAIL_COUNT: 0,
    } as const;

    /** ========== 描述 ========== */
    static readonly DESC = {
        NICK_NAME: '用户昵称',
        PASSWORD: '用户密码（前端传来加密密码，然后再经过sha256加盐后存入数据库）',
        LAST_LOGIN_IP: '用户最后一次登录的 IP 地址',
        LAST_LOGIN_AT: '用户最后一次登录时间',
        EMAIL: '用户登录邮箱',
        AVATAR_URL: '用户头像url',
        LOGIN_FAIL_COUNT: '连续登录失败次数',
        LOCKED_UNTIL: '账户锁定到期时间（为空表示未锁定）',
        GENDER: '性别：0未知 1男 2女',
        BIRTHDAY: '生日',
        SIGNATURE: '个人签名/简介',
    } as const;

    /** ========== 示例值 ========== */
    static readonly EXAMPLE = {
        NICK_NAME: 'user_1001',
        LAST_LOGIN_IP: '127.0.0.1',
        DATETIME: '2025-01-15T10:30:00Z',
        EMAIL: '...@example.com',
        AVATAR_URL: '',
        LOGIN_FAIL_COUNT: 0,
        BIRTHDAY: '1995-08-20',
        SIGNATURE: '这个人很懒，什么都没留下',
    } as const;
}
