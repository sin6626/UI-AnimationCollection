// common/context/current-user.util.ts
import { getCurrentUser } from '../context/request-context.js';

export class CurrentUserUtil {
    /** 静态方法直接拿当前登录用户 */
    static getCurrentUser(): { id: string; email: string } | undefined {
        return getCurrentUser();
    }

    /** 拿用户 ID */
    static getCurrentUserId(): string | undefined {
        return getCurrentUser()?.id;
    }

    /** 拿邮箱 */
    static getCurrentUserEmail(): string | undefined {
        return getCurrentUser()?.email;
    }
}
