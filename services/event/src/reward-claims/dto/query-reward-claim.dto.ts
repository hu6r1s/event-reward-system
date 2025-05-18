import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RewardClaimStatus } from '../constants/reward-claim.constants';

export class QueryRewardClaimDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  eventId: string;

  @IsEnum(RewardClaimStatus)
  @IsOptional()
  status: RewardClaimStatus;
}
