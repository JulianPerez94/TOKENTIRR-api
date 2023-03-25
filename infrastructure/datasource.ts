import * as to from 'typeorm';
import config from '../config/default';

export const getDatasource = () => {
  return new to.DataSource({
    type: 'postgres',
    database: config.dbName,
    synchronize: true,
    host: config.dbHost,
    port: parseInt(config.dbPort as string),
    username: config.dbUser,
    password: config.dbPass,
    entities: [__dirname + '/../model/*{.ts,.js}'],
    migrations: [__dirname + '/../migration/*.ts'],
    migrationsTableName: 'migrations',
  });
};
