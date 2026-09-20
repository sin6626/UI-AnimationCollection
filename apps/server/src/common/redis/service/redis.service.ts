import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client!: Redis;

    onModuleInit() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: Number(process.env.REDIS_DB) || 0,
            maxRetriesPerRequest: 3,
            lazyConnect: false,
        });

        this.client.on('connect', () => {
            this.logger.log('Redis Connected');
        });

        this.client.on('error', (err) => {
            this.logger.error(err);
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    getClient(): Redis {
        return this.client;
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttl?: number): Promise<'OK'> {
        return ttl
            ? this.client.set(key, value, 'EX', ttl)
            : this.client.set(key, value);
    }

    async del(...keys: string[]): Promise<number> {
        return this.client.del(...keys);
    }

    async getJSON<T>(key: string): Promise<T | null> {
        const raw = await this.client.get(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    async setJSON<T>(key: string, value: T, ttl?: number): Promise<'OK'> {
        const raw = JSON.stringify(value);
        return this.set(key, raw, ttl);
    }
}
