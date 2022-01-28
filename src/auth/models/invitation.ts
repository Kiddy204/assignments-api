import { prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { UserRole } from '../../user/models/user-role';

export enum InvitationType {
  REGISTER,
  INVITE,
}

export class Invitation {
  // tslint:disable-next-line: variable-name
  _id: Schema.Types.ObjectId;

  @prop({
    required: true,
    unique: true,
    validate: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  })
  email: string;

  @prop({ required: true })
  firstname: string;

  @prop({ required: true })
  lastname: string;

  @prop({ required: true, enum: UserRole, type: String })
  role: UserRole;

  @prop({ required: true, default: false })
  isSent: boolean;

  @prop({ required: true, default: false })
  isFailed: boolean;

  @prop({ required: true, default: false })
  isCanceled: boolean;

  @prop({ required: true, unique: true })
  verificationKey?: string;

  @prop({ required: true, default: false })
  isVerified: boolean;

  @prop({ required: true, default: false })
  isUsed: boolean;

  @prop({ required: true })
  createdAt: Date;

  @prop()
  lastUpdated?: Date;

  @prop()
  sentDate?: Date;

  @prop()
  failedDate?: Date;

  @prop()
  canceledDate?: Date;

  @prop()
  verifiedDate?: Date;

  @prop()
  usedDate?: Date;

  @prop({ default: InvitationType.INVITE })
  invitationType: InvitationType;
}
