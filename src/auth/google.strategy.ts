import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-token';
import { AuthService } from './services/auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
    });
  }

  public async validate(
    _token: string,
    _refreshToken: string,
    profile: unknown,
  ): Promise<any> {
    const data = await this.authService.signInOrCreateBySocialProvider(
      profile,
      'google',
    );

    return data;
  }
}
