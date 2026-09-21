import {INestApplication} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

const SWAGGER_PATH = 'doc';
const SWAGGER_TITLE = 'UI Animation Collection API';
const SWAGGER_DESCRIPTION = '项目接口文档，认证方式：JWT Bearer';
const SWAGGER_VERSION = '1.0.0';

export function setupSwagger(app: INestApplication): void {
    const enabled = process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true';
    if (!enabled) {
        return;
    }

    const config = new DocumentBuilder()
        .setTitle(SWAGGER_TITLE)
        .setDescription(SWAGGER_DESCRIPTION)
        .setVersion(SWAGGER_VERSION)
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                in: 'header',
                description: '输入 JWT Token（不需要加 Bearer 前缀）',
            },
            'access-token',
        )
        .addServer('https://tomogovo.foo/api', '生产环境（经 Nginx）')
        .addServer('http://localhost:3001', '本地开发')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(SWAGGER_PATH, app, document, {
        customSiteTitle: `${SWAGGER_TITLE} 文档`,
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            docExpansion: 'none',
            displayRequestDuration: true,
            filter: true,
        },
    });

    const port = process.env.PORT ?? 3001;
    console.log(`Swagger UI:   http://localhost:${port}/${SWAGGER_PATH}`);
    console.log(`Swagger JSON: http://localhost:${port}/${SWAGGER_PATH}-json`);
}
