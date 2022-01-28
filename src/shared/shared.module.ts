import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { EncryptionService } from './services/encryption/encryption.service';
import { LoggerService } from './services/logger/logger.service';

@Module({providers: [
    LoggerService,
    EncryptionService,
   
  ],
  exports: [
    LoggerService,
    EncryptionService,
  
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
  ],
})
export class SharedModule {
    
}
