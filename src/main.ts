import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvService } from './shared/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});

  const env = app.get(EnvService);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe(
      {
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false
      }
    )
  )

  const config = new DocumentBuilder()
    .setTitle('Astudy API')
    .setDescription('The Astudy API description')
    .setVersion('1.0')
    .addTag('astudy')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(env.get('PORT') ?? 3000);
}
bootstrap();
