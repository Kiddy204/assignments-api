import { User } from '../../user/models/user';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class JwtPayload {
  @Field(type => User)
  user: User;

  @Field(type => Int)
  expiresIn: number;

  @Field(type => String)
  token: string;
}
