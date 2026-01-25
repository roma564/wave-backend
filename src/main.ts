import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let app: INestApplication;
let server: any;

export default async function handler(req, res) {
  if (!app) {
    app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: [process.env.FRONTEND_URL],
      credentials: true,
    });

    await app.init();
    server = app.getHttpAdapter().getInstance();
  }
  return server(req, res);
}
