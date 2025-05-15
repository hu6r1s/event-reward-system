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
    jwtSecret: stringEnv('JWT_SECRET'),
    saltRounds: numberEnv('PASSWORD_SALT_ROUNDS'),
    expiresIn: stringEnv('ACCESS_TOKEN_EXPIRES_IN'),
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
