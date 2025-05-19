import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
