// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ⭐ THÊM DÒNG NÀY ĐỂ BẬT CORS
  app.enableCors({
    origin: 'http://localhost:3001', // Cho phép client của bạn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'src', 'public'));
  // Đảm bảo cổng là 300 (hoặc một cổng khác 3000)
  await app.listen(process.env.PORT ?? 3000); 
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();