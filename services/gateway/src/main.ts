import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Event Reward System API')
    .setDescription('API documentation for the MSA Event Reward System server')
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'accessToken',
    )
    .addCookieAuth(
      'jid',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'jid',
        description:
          'Refresh token for renewing access token (HTTPOnly Cookie)',
      },
      'refreshTokenCookie',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {});
  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'My Gateway API Docs',
  });

  await app.listen(3000);
}
bootstrap();
