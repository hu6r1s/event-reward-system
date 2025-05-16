import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventRequest } from './dto/EventRequest.dto';
import { EventResponse } from './dto/EventResponse.dto';
import { EventDocument } from './schemas/event.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(request: CreateEventRequest): Promise<{ _id: string }> {
    const event = new this.eventModel(request);
    return { _id: (await event.save())._id.toString() };
  }

  async findAll(): Promise<EventResponse[]> {
    return await this.eventModel.find().exec();
  }

  async findById(_id: string): Promise<EventResponse> {
    const event = await this.eventModel.findById(_id);
    if (!event) throw new NotFoundException('Not found event');

    return event;
  }
}
