export interface IEnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

export interface IDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}
