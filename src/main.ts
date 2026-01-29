import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import config from './app/config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

const port = config.port;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  app.setGlobalPrefix('api/v1', {
    exclude: [''],
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.listen(port ?? 3000, () => {
    console.log(`Server is running on port http://localhost:${port}`);
  });
}
bootstrap().catch(console.error);
