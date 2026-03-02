import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Compression
  app.use(compression());

  // Production Security Headers (Optional: install helmet if needed)
  // app.use(helmet());

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const isDev = process.env.NODE_ENV === 'development';

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS
  app.enableCors({
    origin: isDev ? true : [frontendUrl, 'https://bazaary.shop'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, Cookie, idempotency-key',
  });

  // Enable cookie parser
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: !isDev, // Security: hide details in prod
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  // Start event processor loop
  try {
    const { EventProcessorService } = require('./modules/events/services/event-processor.service');
    const eventProcessor = app.get(EventProcessorService);
    setInterval(() => {
      eventProcessor.process().catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Event processor error:', err);
      });
    }, 4000); 
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Event Processor skipped in this environment (likely tests/migrations)');
  }

  // eslint-disable-next-line no-console
  console.log(`🚀 Bazaary API running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
