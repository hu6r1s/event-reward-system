import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateEventRequest } from './dto/create-event.dto';
import { EventListResponse, EventResponse } from './dto/event-response.dto';
import { EventRewardDto } from './dto/event-reward.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() request: CreateEventRequest): Promise<{ _id: string }> {
    return await this.eventService.create(request);
  }

  @Get()
  async findAll(@Query() queryDto: QueryEventDto): Promise<EventListResponse> {
    return await this.eventService.findAll(queryDto);
  }

  @Get(':_id')
  async findById(@Param('_id') _id: string): Promise<EventResponse> {
    return await this.eventService.findById(_id);
  }

  @Post(':eventId/rewards')
  @HttpCode(HttpStatus.CREATED)
  async addReward(
    @Param('eventId') eventId: string,
    @Body() rewardDto: EventRewardDto,
  ): Promise<{ rewardId: string }> {
    return await this.eventService.addRewardToEvent(eventId, rewardDto);
  }
}
