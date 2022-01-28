import { MongoMemoryServer } from 'mongodb-memory-server';
import { TypegooseModule } from 'nestjs-typegoose';
import { DynamicModule } from '@nestjs/common';

const mongod = new MongoMemoryServer();

// Db for testing.
export const MongoTestMemoryModule = async (): Promise<DynamicModule> =>
  TypegooseModule.forRoot(await mongod.getUri(), {});
