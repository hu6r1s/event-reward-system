import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginStreakResponse } from 'src/user/dto/user-login.dto';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/util/jwt.service';
import { LoginRequest } from './dto/login.dto';
import { RegisterRequest } from './dto/register.dto';

export interface TokenPayload {
  sub: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private tokenService: TokenService,
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

  async login(
    request: LoginRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

    const today = new Date();
    const isSameDate =
      user.lastLoginDate &&
      today.getFullYear() === user.lastLoginDate.getFullYear() &&
      today.getMonth() === user.lastLoginDate.getMonth() &&
      today.getDate() === user.lastLoginDate.getDate();

    if (!isSameDate) {
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (
        !user.lastLoginDate ||
        today.getTime() - user.lastLoginDate.getTime() <= oneDayInMs * 2
      ) {
        user.streakLogins += 1;
      } else {
        user.streakLogins = 1;
      }

      user.lastLoginDate = today;
    }

    await this.userService.update(user._id, {
      streakLogins: user.streakLogins,
      lastLoginDate: user.lastLoginDate,
    });

    const payload: TokenPayload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.tokenService.tokenVerify(refreshToken);
      const user = this.userService.findOne({ _id: payload.sub });
      if (!user) throw new UnauthorizedException('Unverified user');
      return await this.tokenService.generateAccessToken({
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUserLoginStreak(_id: string): Promise<LoginStreakResponse> {
    const user = await this.userService.findOne({ _id });
    if (!user) throw new NotFoundException(`User with ID ${_id} not found`);

    return {
      username: user.username,
      streakLogins: user.streakLogins,
      lastLoginDate: user.lastLoginDate,
    } as LoginStreakResponse;
  }
}
