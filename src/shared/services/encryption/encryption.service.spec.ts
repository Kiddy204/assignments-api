import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedModule } from '../../shared.module';
import { DatabaseModule } from '../../../database/database.module';
import { MongoTestMemoryModule } from '../../../../test/db-test.module';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, EncryptionService],
      imports: [
        await MongoTestMemoryModule(),
        ConfigModule.forRoot({ isGlobal: true }),
        SharedModule,
        DatabaseModule,
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encryptTest', () => {
    it('should encrypt a message', () => {
      const msg = 'helloWorld';
      const encrypted = service.encrypt(msg);
      expect(encrypted).toBeDefined();
      expect(encrypted.indexOf(msg)).toEqual(-1);
    });
  });

  describe('decryptTest', () => {
    it('should decrypt a message', () => {
      const msg = 'helloWorld';
      const encrypted = service.encrypt(msg);
      const decrypted = service.decrypt(encrypted);
      expect(msg).toEqual(decrypted);
    });
  });
});
