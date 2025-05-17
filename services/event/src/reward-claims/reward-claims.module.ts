import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from 'src/event/event.module';
import { RewardClaimsController } from './reward-claims.controller';
import { RewardClaim, RewardClaimSchema } from './schemas/reward-claim.schema';
import { RewardClaimsService } from "./reward-claims.service";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: RewardClaim.name, schema: RewardClaimSchema },
    ]),
    HttpModule,
    EventModule,
  ],
  controllers: [RewardClaimsController],
  providers: [RewardClaimsService]
})
export class RewardClaimsModule {}
