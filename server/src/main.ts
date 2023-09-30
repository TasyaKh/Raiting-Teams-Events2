import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  
  //надо для проверки данных (когда создаем или обновляем)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  const config = new DocumentBuilder()
    .setTitle('Raiting-teams-events API')
    .setDescription('The raiting-teams-events API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('documentation', app, document);
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

 
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);

}

bootstrap();
