import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const authConfig = config.get('config.auth');
        return {
          secret: authConfig.jwtSecret,
          signOptions: { expiresIn: authConfig.expiresIn },
        };
      },
    }),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
