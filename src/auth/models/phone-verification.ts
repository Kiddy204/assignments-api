import { prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

export class PhoneVerification {
  // tslint:disable-next-line: variable-name
  _id: Schema.Types.ObjectId;

  @prop({ required: true, unique: false })
  to: string;

  @prop({ require: false })
  channel: string;

  @prop({ required: true })
  status: string;

  @prop({ required: true })
  valid: boolean;

  @prop({ required: true })
  phoneType: string;

  @prop({ required: false })
  carrier: string;

  @prop({ required: true })
  dateCreated: string;

  @prop({ required: true })
  dateUpdated: string;
}
