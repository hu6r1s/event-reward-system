export class EventListResponse {
  readonly data: AllEventResponse[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export class AllEventResponse {
  readonly _id: string;
  readonly name: string;
  readonly status: string;
  readonly startAt: Date;
  readonly endAt: Date;
}

export class EventResponse {
  readonly name: string;
  readonly description: string;
  readonly status: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly conditions: ConditionResponse[];
  readonly rewards: RewardResponse[];
}

export class ConditionResponse {
  readonly type: string;
  readonly value: number;
}

export class RewardResponse {
  readonly type: string;
  readonly value: any;
  readonly quantity: number;
}
