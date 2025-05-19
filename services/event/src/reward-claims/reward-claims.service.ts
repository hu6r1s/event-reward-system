import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async createClaim(
    eventIdStr: string,
    userIdStr: string,
  ): Promise<{ _id: string }> {
    const eventId = new Types.ObjectId(eventIdStr);
    const userId = new Types.ObjectId(userIdStr);

    const event = await this.validateEventForClaim(eventIdStr);

    await this.ensureNoDuplicateClaim(userId, eventId);

    const { conditionsMet, failureReason } = await this.evaluateEventConditions(
      userIdStr,
      event.conditions,
    );

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

  private async validateEventForClaim(eventIdStr: string) {
    const event = await this.eventService.findById(eventIdStr);
    if (event.status !== EventStatus.ACTIVE) {
      throw new BadRequestException('Event is not active.');
    }
    const now = new Date();
    if (now < new Date(event.startAt) || now > new Date(event.endAt)) {
      throw new BadRequestException('Event is not within the claim period');
    }
    return event;
  }
  private async ensureNoDuplicateClaim(
    userId: Types.ObjectId,
    eventId: Types.ObjectId,
  ) {
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
  }
  private async evaluateEventConditions(
    userIdStr: string,
    conditions: ConditionResponse[],
  ) {
    let conditionsMet = true;
    let failureReason = '';

    if (conditions && conditions.length > 0) {
      try {
        conditionsMet = await this.checkAllEventConditions(
          userIdStr,
          conditions,
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
    return { conditionsMet, failureReason };
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
        try {
          const response = await firstValueFrom(
            this.authClient.send({ cmd: 'user_login_streak' }, { _id: userId }),
          );
          return response.streakLogins >= condition.value;
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
    console.log(userId);
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
    const { page, limit, eventId, status } = queryDto;
    const skip = (page - 1) * limit;
    console.log(page, limit, eventId, status);

    const filter: Record<string, any> = {};
    if (eventId) filter.eventId = eventId;
    if (status) filter.status = status;

    const [rawData, total] = await Promise.all([
      this.rewardClaimModel
        .find(filter)
        .populate('eventId')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.rewardClaimModel.countDocuments(filter).exec(),
    ]);

    const data: AdminRewardClaimResponse[] = await Promise.all(
      rawData.map(async (claim) => {
        const response = await firstValueFrom(
          this.authClient.send(
            { cmd: 'user_info' },
            { _id: claim.userId.toString() },
          ),
        );
        return {
          user: {
            username: response.username as string,
            nickname: response.nickname as string,
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
