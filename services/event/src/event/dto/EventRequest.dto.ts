import { IsDateString, IsIn, IsNotEmpty } from 'class-validator';
import { Status } from '../schemas/event.schema';

export class CreateEventRequest {
  @IsNotEmpty({ message: 'Event name required' })
  readonly name: string;

  @IsNotEmpty({ message: 'Event description required' })
  readonly description: string;

  @IsIn(Object.values(Status))
  readonly status: Status;

  @IsDateString()
  readonly startAt: Date | string;

  @IsDateString()
  readonly endAt: Date | string;
}
