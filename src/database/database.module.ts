import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { Assignment } from 'src/assignments/assignment.model';
import { User } from 'src/user/models/user';

@Module({
    imports: [
        TypegooseModule.forFeature([
          {
            typegooseClass: Assignment,
            schemaOptions: {
              collection: 'assignments',
            },
          },
        ]),
        TypegooseModule.forFeature([
          {
            typegooseClass: User,
            schemaOptions: {
              collection: 'users',
            },
          },
        ]),
    ],
    exports: [
        TypegooseModule.forFeature([
          {
            typegooseClass: Assignment,
            schemaOptions: {
              collection: 'assignments',
            },
          },
        ])
    ]
})
export class DatabaseModule {}
