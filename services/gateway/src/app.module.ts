import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { RewardClaimsModule } from './event/reward-claims/reward-claims.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    EventModule,
    RewardClaimsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
