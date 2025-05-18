import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import {
  EventConditionType,
  EventStatus,
} from 'src/event/constants/event.constants';
import { ConditionResponse } from 'src/event/dto/event-response.dto';
import { EventService } from 'src/event/event.service';
import { RewardClaimStatus } from './constants/reward-claim.constants';
import { QueryRewardClaimDto } from './dto/query-reward-claim.dto';
import {
  AdminRewardClaimResponse,
  RewardClaimListResponse,
  UserRewardClaimResponse,
} from './dto/reward-claim.dto';
import {
  RewardClaim,
  RewardClaimDocument,
} from './schemas/reward-claim.schema';

@Injectable()
export class RewardClaimsService {
  constructor(
    @InjectModel(RewardClaim.name)
    private readonly rewardClaimModel: Model<RewardClaimDocument>,
    private readonly eventService: EventService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async createClaim(
    eventIdStr: string,
    userIdStr: string,
  ): Promise<{ _id: string }> {
    const eventId = new Types.ObjectId(eventIdStr);
    const userId = new Types.ObjectId(userIdStr);

    const event = await this.eventService.findById(eventIdStr);
    if (event.status !== EventStatus.ACTIVE) {
      throw new BadRequestException('Event is not active.');
    }
    const now = new Date();
    if (now < new Date(event.startAt) || now > new Date(event.endAt)) {
      throw new BadRequestException('Event is not within the claim period');
    }

    const existingSuccessClaim = await this.rewardClaimModel.findOne({
      userId,
      eventId,
      status: RewardClaimStatus.SUCCESS,
    });
    if (existingSuccessClaim) {
      throw new ConflictException('Reward already claimed for this event');
    }

    const existingPendingClaim = await this.rewardClaimModel.findOne({
      userId,
      eventId,
      status: RewardClaimStatus.PENDING,
    });
    if (existingPendingClaim) {
      throw new ConflictException(
        'A claim request for this event is already pending',
      );
    }

    let conditionsMet = true;
    let failureReason = '';

    if (event.conditions && event.conditions.length > 0) {
      try {
        conditionsMet = await this.checkAllEventConditions(
          userIdStr,
          event.conditions,
        );
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to verify event conditions due to an external error',
        );
      }
      if (!conditionsMet) {
        failureReason = 'Event conditions not met';
      }
    }

    const newClaim = new this.rewardClaimModel({
      userId,
      eventId,
      status: conditionsMet
        ? RewardClaimStatus.PENDING
        : RewardClaimStatus.FAILED, // 조건 충족시 PENDING, 아니면 FAILED
      failureReason: conditionsMet ? undefined : failureReason,
    });

    if (!conditionsMet) return { _id: (await newClaim.save())._id.toString() };

    try {
      newClaim.status = RewardClaimStatus.SUCCESS;
      newClaim.rewardsGranted.push(...event.rewards);
      await newClaim.save();
    } catch (error) {
      newClaim.status = RewardClaimStatus.FAILED;
      newClaim.reason = error.message || 'Reward granting failed.';
      await newClaim.save();
    }

    return { _id: newClaim._id.toString() };
  }

  private async checkAllEventConditions(
    userId: string,
    conditions: ConditionResponse[],
  ): Promise<boolean> {
    for (const condition of conditions) {
      const met = await this.checkSingleCondition(userId, condition);
      if (!met) return false;
    }
    return true;
  }

  private async checkSingleCondition(
    userId: string,
    condition: ConditionResponse,
  ): Promise<boolean> {
    switch (condition.type) {
      case EventConditionType.LOGIN_STREAK:
        const authServiceUrl = this.configService.get('config.uri').auth;
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${authServiceUrl}/${userId}/login-streak`),
          );
          return response.data.streakLogins >= condition.value;
        } catch (error) {
          console.error('Error fetching login streak:', error);
          return false;
        }

      case EventConditionType.FRIEND_INVITATION_COUNT:
        console.log(
          `Checking FRIEND_INVITATION_COUNT for user ${userId}: required ${condition.value}`,
        );
        return true;

      case EventConditionType.LEVER_GOAL:
        console.log(
          `Checking LEVER_GOAL for user ${userId}: required ${condition.value}`,
        );
        return true;

      default:
        console.warn(`Unknown condition type: ${condition.type}`);
        return false;
    }
  }

  async findUserClaims(userId: string): Promise<UserRewardClaimResponse[]> {
    if (!userId) throw new ForbiddenException('User ID not found in request');
    const claims = await this.rewardClaimModel.find({ userId }).exec();

    return await Promise.all(
      claims.map(async (claim) => {
        const eventId = claim.eventId.toString();
        const event = await this.eventService.findById(eventId);
        return {
          event: {
            name: event.name,
            description: event.description,
          },
          status: claim.status,
          rewardsGranted: claim.rewardsGranted.map((reward) => ({
            type: reward.type,
            value: reward.value,
            quantity: reward.quantity,
          })),
        };
      }),
    );
  }

  async findAllClaimsByAdmin(
    queryDto: QueryRewardClaimDto,
  ): Promise<RewardClaimListResponse> {
    const { page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const [rawData, total] = await Promise.all([
      this.rewardClaimModel
        .find()
        .populate('eventId')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.rewardClaimModel.countDocuments().exec(),
    ]);

    const data: AdminRewardClaimResponse[] = await Promise.all(
      rawData.map(async (claim) => {
        const authServiceUrl = this.configService.get('config.uri').auth;
        console.log(claim.userId.toString());
        const response = await firstValueFrom(
          this.httpService.get(`${authServiceUrl}/${claim.userId.toString()}`),
        );
        return {
          user: {
            username: response.data.username as string,
            nickname: response.data.nickname as string,
          },
          event: {
            name: (claim.eventId as any).name,
            description: (claim.eventId as any).description,
          },
          status: claim.status,
          rewardsGranted: claim.rewardsGranted,
        } as AdminRewardClaimResponse;
      }),
    );

    return { data, total, page, limit } as RewardClaimListResponse;
  }
}
