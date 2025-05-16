import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
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
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const { accessToken, refreshToken } = await this.authService.login(request);

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken } as LoginResponse;
  }

  @Post('refresh')
  async refresh(@Req() request: Request): Promise<LoginResponse> {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token not found');

    const accessToken = await this.authService.refreshAccessToken(refreshToken);
    
    return { accessToken } as LoginResponse;
  }
}
