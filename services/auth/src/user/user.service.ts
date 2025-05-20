import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateUser } from './dto/create.dto';
import { LoginStreakDto } from './dto/user-login.dto';
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
    if (!refreshToken) {
      throw new RpcException(
        JSON.stringify({
          message: 'Unauthorized token',
          status: HttpStatus.UNAUTHORIZED,
        }),
      );
      // throw new UnauthorizedException('Unauthorized token');
    }
  }

  async update(_id: Types.ObjectId, loginStreakDto: LoginStreakDto) {
    const result = await this.userModel
      .updateOne({ _id }, { $set: loginStreakDto }, { new: true })
      .exec();

    if (result.matchedCount === 0) {
      throw new RpcException(
        JSON.stringify({
          message: `User with ID ${_id} not found`,
          status: HttpStatus.NOT_FOUND,
        }),
      );
      // throw new NotFoundException(`User with ID ${_id} not found`);
    }
  }
}
