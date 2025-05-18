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

export class UserInfo {
  username: string;
  nickname: string;
}

export class AdminRewardClaimResponse {
  user: UserInfo;
  event: RewardClaimEvent;
  status: RewardClaimStatus;
  rewardsGranted: EventGranted[];
}

export class RewardClaimListResponse {
  readonly data: AdminRewardClaimResponse[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}
