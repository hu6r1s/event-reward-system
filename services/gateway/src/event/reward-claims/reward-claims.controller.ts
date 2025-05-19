import {
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
import { AuthenticatedUser, User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RpcHelperService } from '../util/send-service.util';
import { QueryRewardClaimDto } from './dto/query-reward-claim.dto';

@Controller('reward-claims')
export class RewardClaimsController {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy,
    private readonly rpcHelper: RpcHelperService,
  ) {}

  @Post('events/:eventId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async requestReward(
    @Param('eventId') eventId: string,
    @User() user: AuthenticatedUser,
  ) {
    return this.rpcHelper.sendToEventService(
      this.eventClient,
      { cmd: 'add_reward_claim' },
      { eventId },
      user,
    );
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async getMyRewardClaims(@User() user: AuthenticatedUser) {
    return this.rpcHelper.sendToEventService(
      this.eventClient,
      { cmd: 'my_reward_claims' },
      {},
      user,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'AUDITOR', 'ADMIN')
  async getAllRewardClaims(@Query() queryDto: QueryRewardClaimDto) {
    console.log(queryDto);
    return this.rpcHelper.sendToEventService(
      this.eventClient,
      { cmd: 'op_reward_claims' },
      queryDto,
    );
  }
}
