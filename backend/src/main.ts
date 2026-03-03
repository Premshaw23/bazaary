import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable Production Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'wss:', 'ws:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Enable Compression
  app.use(compression());

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

  // Graceful shutdown handler
  const gracefulShutdown = async (signal: string) => {
    logger.log(`Received ${signal}, starting graceful shutdown...`);
    try {
      await app.close();
      logger.log('Application closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Register shutdown handlers
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

  // Start event processor loop with better error handling and recovery
  let eventProcessorInterval: NodeJS.Timeout | null = null;
  try {
    const { EventProcessorService } = require('./modules/events/services/event-processor.service');
    const eventProcessor = app.get(EventProcessorService);
    
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 5;
    
    eventProcessorInterval = setInterval(async () => {
      try {
        await eventProcessor.process();
        consecutiveErrors = 0; // Reset on success
      } catch (err) {
        consecutiveErrors++;
        logger.error(`Event processor error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, err);
        
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          logger.error('Event processor has failed too many times, stopping...');
          if (eventProcessorInterval) {
            clearInterval(eventProcessorInterval);
            eventProcessorInterval = null;
          }
        }
      }
    }, 4000);
    
    logger.log('Event processor started successfully');
  } catch (e) {
    logger.warn('Event Processor skipped in this environment (likely tests/migrations)');
  }

  // Register cleanup for event processor
  process.on('beforeExit', () => {
    if (eventProcessorInterval) {
      clearInterval(eventProcessorInterval);
    }
  });

  logger.log(`🚀 Bazaary API running on http://localhost:${port}`);
  logger.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔒 Security: Helmet enabled, CORS configured`);
  logger.log(`⚡ Features: Compression, Rate limiting, Event processing`);
}

bootstrap().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
