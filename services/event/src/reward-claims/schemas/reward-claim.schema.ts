import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import {
  EventReward,
  EventRewardSchema,
} from '../../event/schemas/event.schema';
import { RewardClaimStatus } from '../constants/reward-claim.constants';

export type RewardClaimDocument = RewardClaim & Document;

@Schema({ collection: 'reward_claims', versionKey: false })
export class RewardClaim {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  })
  eventId: Types.ObjectId;

  @Prop({
    enum: RewardClaimStatus,
    required: true,
    default: RewardClaimStatus.PENDING,
    index: true,
  })
  status: RewardClaimStatus;

  @Prop()
  reason?: string;

  @Prop({ type: [EventRewardSchema], default: [] })
  rewardsGranted: Types.DocumentArray<EventReward>;
}

export const RewardClaimSchema = SchemaFactory.createForClass(RewardClaim);
