import { Injectable } from '@nestjs/common';
import { AES } from 'crypto-ts';
import * as CryptoTS from 'crypto-ts';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  constructor(
    private readonly config: ConfigService,
    private logger: LoggerService,
  ) {}

  getKey = (): string => {
    return this.config.get('ENCRYPTION_KEY').toString();
  };

  encrypt = (input: string): string => {
    try {
      return AES.encrypt(input, this.config.get('ENCRYPTION_KEY')).toString();
    } catch (e) {
      this.logger.error(`Exception encrypting. Error is ${e.message}`);
    }
  };

  decrypt = (input: string): string => {
    try {
      return AES.decrypt(input, this.config.get('ENCRYPTION_KEY')).toString(
        CryptoTS.enc.Utf8,
      );
    } catch (e) {
      this.logger.error(`Exception decrypting. Error is ${e}`);
    }
  };

  slugify = (data: string): string => {
    const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·/_,:;';
    const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return data
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  };
}
