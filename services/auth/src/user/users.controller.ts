import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { RegisterRequest } from './dto/register.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() request: RegisterRequest): Promise<string> {
    return await this.userService.register(request);
  }

  @Post('login')
  async login(@Body() request: LoginRequest): Promise<LoginResponse> {
    return await this.userService.login(request);
  }
}
