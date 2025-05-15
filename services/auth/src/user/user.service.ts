import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateUser } from './dto/create.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: CreateUser): Promise<User> {
    const newUser = new this.userModel(data);
    return await newUser.save();
  }

  async findOne(query: FilterQuery<UserDocument>): Promise<User | null> {
    return this.userModel.findOne(query);
  }
}
