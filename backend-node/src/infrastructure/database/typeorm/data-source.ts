import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '../../../shared/config';
// Entities will be imported here as they are created
// import { Menu } from '@domain/entities/Menu';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.db.url,
  synchronize: false, // Always false in production/strict mode
  logging: config.env === 'development',
  entities: ['src/domain/entities/**/*.ts'],
  migrations: ['src/infrastructure/database/typeorm/migrations/**/*.ts'],
  subscribers: [],
});
