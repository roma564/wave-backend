import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });


  await app.listen(process.env.PORT as string);
  console.log(` Server running on port ${process.env.PORT}`);
}
bootstrap();
