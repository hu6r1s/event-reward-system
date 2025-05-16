import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { EventStatus } from '../constants/event.constants';
import { EventConditionDto } from './event-condition.dto';
import { EventRewardDto } from './event-reward.dto';

export class CreateEventRequest {
  @IsNotEmpty({ message: 'Event name required' })
  readonly name: string;

  @IsNotEmpty({ message: 'Event description required' })
  readonly description: string;

  @IsEnum(EventStatus)
  @IsOptional()
  readonly status?: EventStatus;

  @IsDate()
  @Type(() => Date)
  readonly startAt: Date;

  @IsDate()
  @Type(() => Date)
  @MinDate(new Date(), { message: 'End date must be in the future' })
  readonly endAt: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventConditionDto)
  @IsOptional()
  conditions?: EventConditionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventRewardDto)
  @IsOptional()
  rewards?: EventRewardDto[];
}
