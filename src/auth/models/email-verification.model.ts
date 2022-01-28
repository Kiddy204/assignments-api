import { mongoose, prop } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

@ObjectType()
export class EmailVerificationModel extends TimeStamps {
  @Field(() => ID)
  @prop({ auto: true })
  _id: mongoose.Types.ObjectId;

  @Field(() => String)
  @prop({
    required: true,
  })
  email: string;

  @Field(() => String)
  @prop({
    required: true,
  })
  emailToken: string;
}
