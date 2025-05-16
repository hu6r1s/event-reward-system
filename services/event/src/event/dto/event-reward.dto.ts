import { IsDefined, IsEnum, IsNotEmpty, IsNumber, Min } from "class-validator";
import { EventRewardType } from "../constants/event.constants";

export class EventRewardDto {
  @IsEnum(EventRewardType)
  @IsNotEmpty()
  type: EventRewardType;

  @IsDefined()
  @IsNotEmpty()
  value: any;

  @IsNumber()
  @Min(1)
  quantity: number;
}
