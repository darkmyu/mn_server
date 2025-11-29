import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config/interface/config.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors({
    origin: process.env.NODE_ENV === 'development' ? /localhost/ : /mntop.com/,
    credentials: true,
  });

  const config = new DocumentBuilder().build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  const port = configService.get('PORT', { infer: true });

  await app.listen(port);
}
bootstrap();
