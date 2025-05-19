import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { QueryRewardClaimDto } from './dto/query-reward-claim.dto';
import {
  RewardClaimListResponse,
  UserRewardClaimResponse,
} from './dto/reward-claim.dto';
import { AuthenticatedUser } from './interfaces/user.interface';
import { RewardClaimsService } from './reward-claims.service';

@Controller()
export class RewardClaimsController {
  private readonly logger = new Logger(RewardClaimsController.name);

  constructor(private readonly rewardClaimsService: RewardClaimsService) {}

  @MessagePattern({ cmd: 'add_reward_claim' })
  async requestReward(
    @Payload() data: { eventId: string; userContext: AuthenticatedUser },
  ): Promise<{ _id: string }> {
    try {
      return this.rewardClaimsService.createClaim(
        data.eventId,
        data.userContext.userId,
      );
    } catch (err) {
      this.logger.error(`Error in add_reward_claim: ${err.message}`, err.stack);
      throw new RpcException({ status: err.status, message: err.message });
    }
  }

  @MessagePattern({ cmd: 'my_reward_claims' })
  async getMyRewardClaims(
    @Payload() data: { userContext: AuthenticatedUser },
  ): Promise<UserRewardClaimResponse[]> {
    try {
      return this.rewardClaimsService.findUserClaims(data.userContext.userId);
    } catch (err) {
      this.logger.error(`Error in add_reward_claim: ${err.message}`, err.stack);
      throw new RpcException({ status: err.status, message: err.message });
    }
  }

  @MessagePattern({ cmd: 'op_reward_claims' })
  async getAllRewardClaims(
    @Payload() queryDto: QueryRewardClaimDto,
  ): Promise<RewardClaimListResponse> {
    try {
      return this.rewardClaimsService.findAllClaimsByAdmin(queryDto);
    } catch (err) {
      this.logger.error(`Error in add_reward_claim: ${err.message}`, err.stack);
      throw new RpcException({ status: err.status, message: err.message });
    }
  }
}
