import { Injectable } from "@nestjs/common";
import { mongoose, prop } from "@typegoose/typegoose";
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

@Injectable()
export class Assignment extends TimeStamps {

    @prop({ auto: true })
    _id?: mongoose.Types.ObjectId;
  

  
    @prop({ required: true })
    title: string;

    @prop({
        required: true,
      })
    description: string;

    @prop({
        required: true,
      })
    deadline: Date;

    @prop({
        required: true,
        default: false,
      })
    submitted: boolean;

    // @prop({
    //   required: true,
    //   ref: () => Teacher,
    // })
    // teacher: Ref<Teacher>;

}