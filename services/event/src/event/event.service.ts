import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventStatus } from './constants/event.constants';
import { CreateEventRequest } from './dto/create-event.dto';
import {
  AllEventResponse,
  EventListResponse,
  EventResponse,
} from './dto/event-response.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { EventDocument } from './schemas/event.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
  ) {}

  async create(request: CreateEventRequest): Promise<{ _id: string }> {
    const { startAt, endAt } = request;
    if (new Date(endAt) <= new Date(startAt)) {
      throw new BadRequestException('End date must be after start date');
    }

    let status = request.status;
    if (!status) {
      const now = new Date();
      if (new Date(startAt) > now || new Date(endAt) < now) {
        status = EventStatus.INACTIVE;
      } else {
        status = EventStatus.ACTIVE;
      }
    }

    const event = new this.eventModel({ ...request, status });
    return { _id: (await event.save())._id.toString() };
  }

  async findAll(queryDto: QueryEventDto): Promise<EventListResponse> {
    const { page, limit, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    const projection = Object.keys(new AllEventResponse()).join(' ');

    const [rawData, total] = await Promise.all([
      this.eventModel
        .find()
        .select(projection)
        .sort([[sortBy, sortOrder === 'ASC' ? 1 : -1]])
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments().exec(),
    ]);

    const data: AllEventResponse[] = rawData.map((event) => ({
      name: event.name,
      status: event.status,
      startAt: event.startAt,
      endAt: event.endAt,
    }));

    return {
      data,
      total,
      page,
      limit,
    } as EventListResponse;
  }

  async findById(_id: string): Promise<EventResponse> {
    const event = await this.eventModel.findById(_id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID "${_id}" not found`);
    }
    return event;
  }
}
