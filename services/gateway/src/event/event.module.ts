import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { RolesGuard } from 'src/guards/roles.guard';
import { EventController } from './event.controller';
import { RpcHelperService } from './util/rpc-helper.service';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'EVENT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const uriConfig = config.get('config.uri');
          return {
            transport: Transport.TCP,
            options: {
              host: uriConfig.eventServiceHost,
              port: uriConfig.eventServicePort,
            },
          };
        },
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const authConfig = configService.get('config.auth');
        return {
          secret: authConfig.jwtAccessSecret,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [EventController],
  providers: [JwtStrategy, RolesGuard, RpcHelperService],
  exports: [ClientsModule, PassportModule, RolesGuard, RpcHelperService],
})
export class EventModule {}
