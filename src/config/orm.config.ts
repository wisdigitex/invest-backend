// src/config/orm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig(); // <– Load .env from project root

const ormConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'invest_platform',
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: true, // For dev only
    logging: false,
  };
};

console.log("\nENV CHECK:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export default ormConfig;
