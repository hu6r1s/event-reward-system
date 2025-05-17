import {
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { RewardClaimsService } from './reward-claims.service';

@Controller('reward-claims')
export class RewardClaimsController {
  constructor(private readonly rewardClaimsService: RewardClaimsService) {}

  @Post('events/:eventId')
  @HttpCode(HttpStatus.CREATED)
  async requestReward(
    @Param('eventId') eventId: string,
    // @UserId() userId: string,
  ): Promise<{ _id: string }> {
    // TODO add userId info
    // const userId = '6828ab4b4de696b8034c7633';
    if (!userId) throw new ForbiddenException('User ID not found in request');
    return this.rewardClaimsService.createClaim(eventId, userId);
  }
}
