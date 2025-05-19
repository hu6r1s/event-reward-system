import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CreateEventRequest } from './dto/create-event.dto';
import { EventListResponse, EventResponse } from './dto/event-response.dto';
import { EventRewardDto } from './dto/event-reward.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { EventService } from './event.service';

@Controller()
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

  @MessagePattern({ cmd: 'create_event' })
  async create(
    @Payload() request: CreateEventRequest,
  ): Promise<{ _id: string }> {
    try {
      return await this.eventService.create(request);
    } catch (err) {
      this.logger.error(`Error in create_event: ${err.message}`, err.stack);
      throw new RpcException({ status: err.status, message: err.message });
    }
  }

  @MessagePattern({ cmd: 'event_all_search' })
  async findAll(
    @Payload() queryDto: QueryEventDto,
  ): Promise<EventListResponse> {
    try {
      return await this.eventService.findAll(queryDto);
    } catch (err) {
      this.logger.error(`Error in event_all_search: ${err.message}`, err.stack);
      throw new RpcException({ status: err.status, message: err.message });
    }
  }

  @MessagePattern({ cmd: 'event_detail_search' })
  async findById(@Payload() _id: string): Promise<EventResponse> {
    try {
      return await this.eventService.findById(_id);
    } catch (err) {
      this.logger.error(
        `Error in event_detail_search: ${err.message}`,
        err.stack,
      );
      throw new RpcException({ status: err.status, message: err.message });
    }
  }

  @MessagePattern({ cmd: 'add_reward' })
  async addReward(
    @Payload() data: { eventId: string; rewardDto: EventRewardDto },
  ): Promise<{ rewardId: string }> {
    try {
      return await this.eventService.addRewardToEvent(
        data.eventId,
        data.rewardDto,
      );
    } catch (err) {
      this.logger.error(`Error in add_reward: ${err.message}`, err.stack);
      throw new RpcException({ status: err.status, message: err.message });
    }
  }
}
