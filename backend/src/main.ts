import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

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
  }, 2000); // every 2 seconds

  console.log(`🚀 Bazaary API running on http://localhost:${port}`);
}
bootstrap();