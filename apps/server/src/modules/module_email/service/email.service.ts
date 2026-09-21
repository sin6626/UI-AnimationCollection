import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {SentMessageInfo} from "nodemailer";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
import {readFileSync} from "node:fs";

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly templatesDir: string;
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly configService: ConfigService) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        this.templatesDir = join(__dirname, 'templates');

        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: this.configService.get<number>('MAIL_PORT') === 465,
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
        });
    }

    async sendMail(to: string, subject: string, html: string): Promise<void> {
        try {
            const info: SentMessageInfo = await this.transporter.sendMail({
                from: this.configService.get<string>('MAIL_FROM'),
                to,
                subject,
                html,
            });
            this.logger.log(`邮件已发送: ${info.messageId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`发送邮件失败: ${message}`);
            throw error;
        }
    }

    async sendVerificationCode(to: string, code: string, expireMinutes = 5): Promise<void> {
        const template = readFileSync(
            join(this.templatesDir, 'verification-code.html'),
            'utf-8',
        );

        const html = template
            .replace(/\{\{code\}\}/g, code)
            .replace(/\{\{expireMinutes\}\}/g, String(expireMinutes));

        await this.sendMail(to, '邮箱验证码', html);
    }
}
