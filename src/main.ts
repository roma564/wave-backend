import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // лог кожного запиту на upload (щоб бачити, чи запит взагалі доходить до сервера)
  app.use((req: any, res: any, next: () => void) => {
    if (req.url?.startsWith('/files/upload') && req.method === 'POST') {
      console.log('[Upload] POST /files/upload — запит прийшов на сервер');
    }
    next();
  });

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:5173',
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  await app.listen(process.env.PORT as string);
  console.log(` Server running on port ${process.env.PORT}`);
}
bootstrap();
