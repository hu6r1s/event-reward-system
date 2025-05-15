import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { RegisterRequest } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() request: RegisterRequest): Promise<{ _id: string }> {
    return await this.authService.register(request);
  }

  @Post('login')
  async login(@Body() request: LoginRequest): Promise<LoginResponse> {
    return await this.authService.login(request);
  }
}
