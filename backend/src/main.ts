
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Compression
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Enable cookie parser
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  // Start event processor loop
  const eventProcessor = app.get(
    require('./modules/events/services/event-processor.service').EventProcessorService
  );
  setInterval(() => {
    eventProcessor.process().catch((err) => {
      console.error('Event processor error:', err);
    });
  }, 4000); // every 2 seconds

  console.log(`🚀 Bazaary API running on http://localhost:${port}`);
}
bootstrap();