import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { RegisterRequest } from './dto/register.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(request: RegisterRequest): Promise<string> {
    const { username, password, nickname, role } = request;
    const existing = await this.userModel.findOne({ username });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const salt = await bcrypt.genSalt(
      this.config.get('config.auth').saltRounds,
    );
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      nickname,
      role,
    });

    return (await newUser.save())._id.toString();
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    const user = await this.userModel.findOne({ username: request.username });
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

    const payload = { sub: user._id, username: user.username, role: user.role };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken } as LoginResponse;
  }
}
