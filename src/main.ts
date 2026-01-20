import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  
const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // app.enableCors();
  
  app.enableCors({
  origin: true,
  credentials: true,
});



  app.use(cookieParser());

  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URL-префікс
  });
  // await app.listen(5000, '192.168.0.105');
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();

