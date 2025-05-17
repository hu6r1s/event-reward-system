import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { RewardClaimStatus } from '../constants/reward-claim.constants';

export class QueryRewardClaimDto {
  @IsOptional()
  @IsMongoId()
  userId: string; // 관리자용 필터

  @IsOptional()
  @IsMongoId()
  eventId: string; // 관리자 및 사용자용 필터

  @IsOptional()
  @IsEnum(RewardClaimStatus)
  status: RewardClaimStatus; // 관리자 및 사용자용 필터

  @IsDate()
  @Type(() => Date)
  requestedAt: Date;

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

  @IsOptional()
  @IsString()
  sortBy?: string = 'requestedAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
