import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  auth: {
    jwtAccessSecret: stringEnv('JWT_ACCESS_SECRET'),
    accessTokenExpiresIn: numberEnv('ACCESS_TOKEN_EXPIRES_IN'),
    jwtRefreshSecret: stringEnv('JWT_REFRESH_SECRET'),
    refreshTokenExpiresIn: numberEnv('REFRESH_TOKEN_EXPIRES_IN'),
  },
  uri: {
    authServiceHost: stringEnv('AUTH_SERVICE_HOST'),
    authServicePort: numberEnv('AUTH_SERVICE_PORT'),
    eventServiceHost: stringEnv('EVENT_SERVICE_HOST'),
    eventServicePort: numberEnv('EVENT_SERVICE_PORT'),
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
