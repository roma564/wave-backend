import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let app: INestApplication;
let server: any;

export default async function handler(req, res) {
  if (!server) {
    app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
      methods: 'GET,POST,PUT,DELETE,PATCH',
      allowedHeaders: 'Content-Type, Authorization',
    });



    await app.init();
    server = app.getHttpAdapter().getInstance();
  }
  return server(req, res);
}
