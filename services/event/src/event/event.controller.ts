import { Body, Controller, Post } from '@nestjs/common';
import { CreateEventRequest } from './dto/EventRequest.dto';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() request: CreateEventRequest): Promise<{ _id: string }> {
    return this.eventService.create(request);
  }
}
