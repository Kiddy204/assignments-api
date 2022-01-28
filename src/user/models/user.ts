import { mongoose, prop, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { UserRole } from './user-role';

export enum LoginType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

export class User extends TimeStamps {
  @prop({ auto: true })
  _id: mongoose.Types.ObjectId;

  @prop({
    required: true,
    unique: true,
  })
  login: string;

  @prop({
    unique: true,
    sparse: true,
    validate: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  })
  email: string;

  @prop({
    required: true,
  })
  password: string;

  @prop({
    unique: true,
    sparse: true,
    //validate: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
  })
  phoneNumber: string;

  // @prop()
  // verificationKey?: string;

  // @prop({ required: true, default: false })
  // isVerified: boolean;

  // @prop()
  // verifiedDate?: Date;

  @prop({ enum: UserRole, type: String, default: UserRole.USER })
  role: UserRole;

  // @prop()
  // facebook_id?: string;

  // @prop()
  // google_id?: string;

  // @prop()
  // twitter_id?: string;


}
