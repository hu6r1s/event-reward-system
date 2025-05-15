import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { RegisterRequest } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async register(request: RegisterRequest): Promise<{ _id: string }> {
    const { username, password, nickname, role } = request;
    const existing = await this.userService.findOne({ username });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const salt = await bcrypt.genSalt(
      this.config.get('config.auth').saltRounds,
    );
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.userService.create({
      username,
      password: hashedPassword,
      nickname,
      role,
    });

    return { _id: newUser._id.toString() };
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    const user = await this.userService.findOne({
      username: request.username,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const passwordMatched = await bcrypt.compare(
      request.password,
      user.password,
    );
    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken } as LoginResponse;
  }
}
