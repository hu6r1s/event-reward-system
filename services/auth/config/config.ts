import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  mongo: {
    username: stringEnv("MONGO_USER"),
    password: stringEnv("MONGO_PASSWORD"),
    database: stringEnv("DB_NAME"),
    host: stringEnv("MONGO_HOST"),
    port: stringEnv("MONGO_PORT"),
  },
  jwt: {
    secret: stringEnv("JWT_SECRET")
  },
}));

function stringEnv(name: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  }
  throw new Error(`Environment variable ${name} is not set`);
}
