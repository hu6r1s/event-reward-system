import { Status } from "../schemas/event.schema";

export class EventResponse {
  readonly name: string;

  readonly description: string;

  readonly status: string;

  readonly startAt: Date | string;

  readonly endAt: Date | string;
}
