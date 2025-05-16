import { IsEnum, IsNotEmpty } from 'class-validator';
import { EventConditionType } from '../constants/event.constants';

export class EventConditionDto {
  @IsEnum(EventConditionType)
  @IsNotEmpty()
  type: EventConditionType;

  @IsNotEmpty()
  value: number;
}
