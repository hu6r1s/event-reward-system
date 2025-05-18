import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserId } from './decorators/user-id.decorator';
import { UserRewardClaimResponse } from './dto/reward-claim.dto';
import { RewardClaimsService } from './reward-claims.service';

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

  @Get('me')
  async getMyRewardClaims(
    @UserId() userId: string,
  ): Promise<UserRewardClaimResponse[]> {
    return this.rewardClaimsService.findUserClaims(userId);
  }
}
