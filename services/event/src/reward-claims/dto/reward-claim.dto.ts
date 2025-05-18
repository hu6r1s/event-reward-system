import { EventRewardType } from 'src/event/constants/event.constants';
import { RewardClaimStatus } from '../constants/reward-claim.constants';

export class UserRewardClaimResponse {
  event: RewardClaimEvent;
  status: RewardClaimStatus;
  rewardsGranted: EventGranted[];
}

export class RewardClaimEvent {
  name: string;
  description: string;
}

export class EventGranted {
  type: EventRewardType;

  value: any;

  quantity: number;
}
