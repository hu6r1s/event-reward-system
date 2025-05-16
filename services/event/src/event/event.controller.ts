import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateEventRequest } from './dto/EventRequest.dto';
import { EventService } from './event.service';
import { EventResponse } from "./dto/EventResponse.dto";

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() request: CreateEventRequest): Promise<{ _id: string }> {
    return await this.eventService.create(request);
  }

  @Get()
  async findAll(): Promise<EventResponse[]> {
    return await this.eventService.findAll();
  }
}
