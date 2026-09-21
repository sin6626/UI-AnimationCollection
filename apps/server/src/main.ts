import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module.js';
import {AllExceptionsFilter} from "./common/filters/all-exceptions.filter.js";
import {setupSwagger} from "./common/config/swagger.config.js";
import {CommonConstants} from "./common/constants/common.constants.js";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new AllExceptionsFilter());
    app.enableCors({
        origin: true,
        credentials: true,
        methods: [CommonConstants.HTTP_METHOD.GET,
            CommonConstants.HTTP_METHOD.POST,
            CommonConstants.HTTP_METHOD.PUT,
            CommonConstants.HTTP_METHOD.DELETE,
            CommonConstants.HTTP_METHOD.PATCH,
            CommonConstants.HTTP_METHOD.OPTIONS
        ],
        allowedHeaders: [CommonConstants.HEADER.CONTENT_TYPE,
            CommonConstants.HEADER.AUTHORIZATION,
            CommonConstants.HEADER.ACCEPT
        ],
    });
    setupSwagger(app);
    await app.listen(process.env.PORT ?? 3001);
}

await bootstrap();
