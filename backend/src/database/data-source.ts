import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { postgresConfig } from '../config/database.config';

// Only pick PostgresConnectionOptions properties from postgresConfig
const { database, host, port, username, password, ssl, schema } = postgresConfig as PostgresConnectionOptions;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database: String(database),
  ssl,
  schema,
  migrations: ['src/database/migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
  synchronize: false, // Should be false in production
  logging: process.env.NODE_ENV === 'development',
  timezone: 'Z', // Force UTC for all timestamps
} as PostgresConnectionOptions);