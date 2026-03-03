import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3001),

  // Database - PostgreSQL
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Database - MongoDB
  MONGO_URI: Joi.string().uri().required(),

  // Cache - Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().default(6379),

  // Security
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // External Services
  STRIPE_SECRET_KEY: Joi.string().pattern(/^sk_/).required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  MEILISEARCH_HOST: Joi.string().uri().default('http://localhost:7700'),
  MEILISEARCH_API_KEY: Joi.string().optional(),

  // File Storage
  MINIO_ENDPOINT: Joi.string().default('localhost'),
  MINIO_PORT: Joi.number().port().default(9000),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_BUCKET_NAME: Joi.string().default('bazaary-files'),

  // Application URLs
  FRONTEND_URL: Joi.string().uri().required(),
  BACKEND_URL: Joi.string().uri().optional(),

  // Email Configuration (if using email service)
  MAIL_HOST: Joi.string().optional(),
  MAIL_PORT: Joi.number().port().optional(),
  MAIL_USER: Joi.string().email().optional(),
  MAIL_PASSWORD: Joi.string().optional(),
  MAIL_FROM: Joi.string().email().optional(),

  // Monitoring
  SENTRY_DSN: Joi.string().uri().optional(),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60000), // 1 minute
  THROTTLE_LIMIT: Joi.number().default(120), // requests per TTL
});

export const validate = (config: Record<string, unknown>) => {
  const { error, value } = validationSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const missingVars = error.details
      .map((detail) => detail.path.join('.'))
      .join(', ');
    
    throw new Error(`Environment validation failed for: ${missingVars}\n${error.message}`);
  }

  return value;
};

// Export individual config getters for type safety
export const getConfig = () => {
  const config = validate(process.env);
  
  return {
    // App
    nodeEnv: config.NODE_ENV as string,
    port: config.PORT as number,
    isProduction: config.NODE_ENV === 'production',
    isDevelopment: config.NODE_ENV === 'development',
    
    // Database
    database: {
      host: config.DB_HOST as string,
      port: config.DB_PORT as number,
      username: config.DB_USER as string,
      password: config.DB_PASSWORD as string,
      database: config.DB_NAME as string,
    },
    
    // MongoDB
    mongodb: {
      uri: config.MONGO_URI as string,
    },
    
    // Redis
    redis: {
      host: config.REDIS_HOST as string,
      port: config.REDIS_PORT as number,
    },
    
    // JWT
    jwt: {
      secret: config.JWT_SECRET as string,
      expiresIn: config.JWT_EXPIRES_IN as string,
    },
    
    // External Services
    stripe: {
      secretKey: config.STRIPE_SECRET_KEY as string,
      webhookSecret: config.STRIPE_WEBHOOK_SECRET as string,
    },
    
    // URLs
    frontendUrl: config.FRONTEND_URL as string,
    backendUrl: config.BACKEND_URL as string | undefined,
    
    // Throttling
    throttle: {
      ttl: config.THROTTLE_TTL as number,
      limit: config.THROTTLE_LIMIT as number,
    },
  };
};