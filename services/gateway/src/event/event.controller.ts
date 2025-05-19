import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateEventRequest } from './dto/create-event.dto';
import { EventRewardDto } from './dto/event-reward.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { RpcHelperService } from './util/send-service.util';

@Controller('events')
export class EventController {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy,
    private readonly rpcHelper: RpcHelperService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  async create(@Body() request: CreateEventRequest) {
    return this.rpcHelper.sendToEventService(
      this.eventClient,
      { cmd: 'create_event' },
      request,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() queryDto: QueryEventDto) {
    return this.rpcHelper.sendToEventService(
      this.eventClient,
      { cmd: 'event_all_search' },
      queryDto,
    );
  }

  @Get(':_id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async findById(@Param('_id') _id: string) {
    return this.rpcHelper.sendToEventService(
      this.eventClient,
      { cmd: 'event_detail_search' },
      _id,
    );
  }

  @Post(':eventId/rewards')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  async addReward(
    @Param('eventId') eventId: string,
    @Body() rewardDto: EventRewardDto,
  ) {
    return this.rpcHelper.sendToEventService(
      this.eventClient,
      { cmd: 'add_reward' },
      { eventId, rewardDto },
    );
  }
}
