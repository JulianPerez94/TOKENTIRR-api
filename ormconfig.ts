import * as dotenv from 'dotenv';
dotenv.config();
module.exports = {
  type: 'postgres',
  database: process.env.POSTGRES_DB,
  synchronize: true,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  entities: ['src/model/*{.ts,.js}'],
  migrations: ['src/migration/*.ts'],
  migrationsTableName: 'migrations',
  factories: ['seeding/factories/*{.ts,.js}'],
  seeds: ['seeding/seeds/*{.ts,.js}'],
};
