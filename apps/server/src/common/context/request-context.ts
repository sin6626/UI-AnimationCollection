// common/context/request-context.ts
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
    user?: { id: string; email: string };
}

export const requestContext = new AsyncLocalStorage<RequestContextData>();

export function getCurrentUser() {
    return requestContext.getStore()?.user;
}
