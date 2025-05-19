import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const uriConfig = config.get('config.uri');
          return {
            transport: Transport.TCP,
            options: {
              host: uriConfig.authServiceHost,
              port: uriConfig.authServicePort,
            },
          };
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [],
  exports: [ClientsModule]
})
export class AuthModule {}
