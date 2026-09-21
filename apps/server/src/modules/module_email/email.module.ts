import {Global, Module} from '@nestjs/common';
import {EmailService} from './service/email.service.js';

@Module({
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {
}
