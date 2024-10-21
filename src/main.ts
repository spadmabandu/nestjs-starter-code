import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform incoming payloads from plain JS objects to typed objects according to the corresponding DTO class
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') || '8080';

  await app.listen(port);
}

bootstrap();
