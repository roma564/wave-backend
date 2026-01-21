import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export default async function handler(req, res) {
  const app = await NestFactory.create(AppModule);
  await app.init();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}
