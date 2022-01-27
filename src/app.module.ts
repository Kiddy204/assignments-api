import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://root:root@cluster0.whays.mongodb.net/assignments_app?retryWrites=true&w=majority'),
    AssignmentsModule,
     ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
