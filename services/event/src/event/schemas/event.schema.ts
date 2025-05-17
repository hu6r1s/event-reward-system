import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import {
  EventConditionType,
  EventRewardType,
  EventStatus,
} from '../constants/event.constants';

export type EventDocument = Event & Document;

@Schema({ _id: false, versionKey: false })
export class EventCondition {
  @Prop({ enum: EventConditionType, required: true })
  type: EventConditionType;

  @Prop({ required: true })
  value: number;
}
export const EventConditionSchema =
  SchemaFactory.createForClass(EventCondition);

@Schema({ _id: true, versionKey: false })
export class EventReward {
  @Prop({ enum: EventRewardType, required: true })
  type: EventRewardType;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  value: any;

  @Prop({ required: true })
  quantity: number;
}
export const EventRewardSchema = SchemaFactory.createForClass(EventReward);

@Schema()
export class Event {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    enum: EventStatus,
    default: EventStatus.INACTIVE,
    index: true,
  })
  status: EventStatus;

  @Prop({ type: [EventConditionSchema], default: [] })
  conditions: Types.DocumentArray<EventCondition>;

  @Prop({ type: [EventRewardSchema], default: [] })
  rewards: Types.DocumentArray<EventReward>;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;
}
export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.pre<Event>('save', function (next) {
  if (this.endAt <= this.startAt) {
    next(new Error('End date must be after start date.'));
  } else {
    next();
  }
});
