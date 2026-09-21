export class UserConstants {
    static readonly USER = {
        TABLE_NAME: 'users',

        COLUMN: {
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
        },

        LENGTH: {
            NICK_NAME: 10,
            PASSWORD: 255,
            LAST_LOGIN_IP: 45,
            EMAIL: 100,
            AVATAR_URL: 200,
            SIGNATURE: 255,
        },

        DEFAULT: {
            LOGIN_FAIL_COUNT: 0,
        },

        DESC: {
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
        },

        EXAMPLE: {
            NICK_NAME: 'user_1001',
            LAST_LOGIN_IP: '127.0.0.1',
            DATETIME: '2025-01-15T10:30:00Z',
            EMAIL: '...@example.com',
            AVATAR_URL: '',
            LOGIN_FAIL_COUNT: 0,
            BIRTHDAY: '1995-08-20',
            SIGNATURE: '这个人很懒，什么都没留下',
        },
    } as const;

    static readonly THIRD_PARTY = {
        TABLE_NAME: 'user_third_party',

        COLUMN: {
            USER_ID: 'user_id',
            PROVIDER: 'provider',
            OPEN_ID: 'open_id',
            USERNAME: 'username',
            NICKNAME: 'nickname',
            AVATAR: 'avatar',
            EMAIL: 'email',
            RAW_DATA: 'raw_data',
            BOUND_AT: 'bound_at',
        },

        LENGTH: {
            PROVIDER: 20,
            OPEN_ID: 64,
            USERNAME: 100,
            NICKNAME: 100,
            AVATAR: 500,
            EMAIL: 100,
        },

        DESC: {
            USER_ID: '关联的本地用户ID',
            PROVIDER: '第三方平台',
            OPEN_ID: '第三方平台的用户唯一标识',
            USERNAME: '第三方平台的用户名',
            NICKNAME: '第三方平台的昵称',
            AVATAR: '第三方平台的头像',
            EMAIL: '第三方平台返回的邮箱',
            RAW_DATA: '第三方原始数据',
            BOUND_AT: '首次绑定时间',
        },

        EXAMPLE: {
            USER_ID: 1,
            PROVIDER: 'github',
            OPEN_ID: '583231',
            USERNAME: 'octocat',
            NICKNAME: 'monalisa octocat',
            AVATAR: 'https://github.com/images/error/octocat_happy.gif',
            EMAIL: 'octocat@github.com',
            DATETIME: '2025-01-15T10:30:00Z',
        },
    } as const;
}
