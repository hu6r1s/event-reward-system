import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from 'src/event/event.module';
import { RewardClaimsController } from './reward-claims.controller';
import { RewardClaimsService } from './reward-claims.service';
import { RewardClaim, RewardClaimSchema } from './schemas/reward-claim.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: RewardClaim.name, schema: RewardClaimSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const gateway = config.get('config.gateway');
          return {
            transport: Transport.TCP,
            options: {
              host: gateway.authHost,
              port: gateway.authPort,
            },
          };
        },
      },
    ]),
    EventModule,
  ],
  controllers: [RewardClaimsController],
  providers: [RewardClaimsService, ClientsModule],
})
export class RewardClaimsModule {}
