import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { LoginStreakResponse } from '../user/dto/user-login.dto';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { RegisterRequest } from './dto/register.dto';
import { UserInfo } from './dto/user-info.dto';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register_user' })
  async register(
    @Payload() payload: RegisterRequest,
  ): Promise<{ _id: string }> {
    try {
      return await this.authService.register(payload);
    } catch (err) {
      this.logger.error(`Error in register_user: ${err.message}`, err.stack);
      throw new RpcException({ status: err.status, message: err.message });
    }
  }

  @MessagePattern({ cmd: 'login_user' })
  async login(@Payload() payload: LoginRequest): Promise<LoginResponse> {
    try {
      const { accessToken, refreshToken } =
        await this.authService.login(payload);

      return { accessToken, refreshToken } as LoginResponse;
    } catch (err) {
      this.logger.error(`Error in login_user: ${err.message}`, err.stack);
      throw new RpcException({ status: err.status, message: err.message });
    }
  }

  @MessagePattern({ cmd: 'user_token_refresh' })
  async refresh(@Payload() refreshToken: string): Promise<LoginResponse> {
    try {
      const accessToken =
        await this.authService.refreshAccessToken(refreshToken);
      return { accessToken } as LoginResponse;
    } catch (err) {
      this.logger.error(
        `Error in user_token_refresh: ${err.message}`,
        err.stack,
      );
      throw new RpcException({ status: err.status, message: err.message });
    }
  }

  @MessagePattern({ cmd: 'user_login_streak' })
  async getLoginStreak(@Payload() _id: string): Promise<LoginStreakResponse> {
    try {
      return this.authService.getUserLoginStreak(_id);
    } catch (err) {
      this.logger.error(
        `Error in user_login_streak: ${err.message}`,
        err.stack,
      );
      throw new RpcException({ status: err.status, message: err.message });
    }
  }

  @MessagePattern({ cmd: 'user_info' })
  async getUserInfo(@Payload() _id: string): Promise<UserInfo> {
    return this.authService.getUserInfo(_id);
  }
}
