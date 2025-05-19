import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from '../event.module';
import { RewardClaimsController } from './reward-claims.controller';

@Module({
  imports: [ConfigModule, EventModule],
  controllers: [RewardClaimsController],
  providers: [],
})
export class RewardClaimsModule {}
