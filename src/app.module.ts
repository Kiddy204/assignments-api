import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssignmentsModule } from './assignments/assignments.module';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { TypegooseModule } from 'nestjs-typegoose';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    //MongooseModule.forRoot('mongodb+srv://root:root@cluster0.whays.mongodb.net/assignments_app?retryWrites=true&w=majority'),
    TypegooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        console.log(`configService.get<string>('ENDPOINT')`, configService.get<string>('ENDPOINT'))
        return {
          uri: 'mongodb+srv://root:root@cluster0.whays.mongodb.net/assignments_app?retryWrites=true&w=majority)',
          useNewUrlParser: true,
          useUnifiedTopology: true,
          //useFindAndModify: false,
          //useCreateIndex: true,
        };
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    AssignmentsModule,
    SharedModule,
    DatabaseModule,
    UserModule,
     ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
