import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  mongo: {
    username: stringEnv('MONGO_USER'),
    password: stringEnv('MONGO_PASSWORD'),
    database: stringEnv('DB_NAME'),
    host: stringEnv('MONGO_HOST'),
    port: stringEnv('MONGO_PORT'),
  },
  auth: {
    jwtAccessSecret: stringEnv('JWT_ACCESS_SECRET'),
    accessTokenExpiresIn: numberEnv('ACCESS_TOKEN_EXPIRES_IN'),
  },
  gateway: {
    authHost: stringEnv('AUTH_SERVICE_HOST'),
    authPort: numberEnv('AUTH_SERVICE_PORT'),
    eventHost: stringEnv('EVENT_SERVICE_HOST'),
    eventPort: numberEnv('EVENT_SERVICE_PORT'),
  },
}));

function stringEnv(name: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  }
  throw new Error(`Environment variable ${name} is not set`);
}

function numberEnv(name: string): number {
  const value = process.env[name];
  if (value) {
    return parseInt(value, 10);
  }
  throw new Error(`Environment variable ${name} is not set`);
}
