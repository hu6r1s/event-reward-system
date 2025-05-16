import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema()
export class Event {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: Object.values(Status) })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
