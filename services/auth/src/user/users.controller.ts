import { Body, Controller, Post } from '@nestjs/common';
import { RegisterRequest } from './dto/register.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() request: RegisterRequest): Promise<string> {
    return this.userService.register(request);
  }
}
