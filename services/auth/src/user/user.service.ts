import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateUser } from './dto/create.dto';
import { LoginStreakDto, LoginStreakResponse } from './dto/user-login.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(data: CreateUser): Promise<User> {
    const newUser = new this.userModel(data);
    return await newUser.save();
  }

  async findOne(query: FilterQuery<UserDocument>): Promise<User | null> {
    return this.userModel.findOne(query);
  }

  async findUserValidRefreshToken(_id: string) {
    const refreshToken = this.cacheManager.get(_id);
    if (!refreshToken) throw new UnauthorizedException('Unauthorized token');
  }

  async update(_id: Types.ObjectId, loginStreakDto: LoginStreakDto) {
    const result = await this.userModel
      .updateOne({ _id }, { $set: loginStreakDto }, { new: true })
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException(`User with ID ${_id} not found`);
    }
  }
}
