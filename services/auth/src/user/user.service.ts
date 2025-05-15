import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RegisterRequest } from './dto/register.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private config: ConfigService,
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
}
