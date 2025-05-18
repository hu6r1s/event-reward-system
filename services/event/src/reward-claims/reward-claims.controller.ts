import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RewardClaimsService } from './reward-claims.service';
import { UserId } from "./decorators/user-id.decorator";

@Controller('reward-claims')
export class RewardClaimsController {
  constructor(private readonly rewardClaimsService: RewardClaimsService) {}

  @Post('events/:eventId')
  @HttpCode(HttpStatus.CREATED)
  async requestReward(
    @Param('eventId') eventId: string,
    @UserId() userId: string,
  ): Promise<{ _id: string }> {
    if (!userId) throw new ForbiddenException('User ID not found in request');
    return this.rewardClaimsService.createClaim(eventId, userId);
  }
}
