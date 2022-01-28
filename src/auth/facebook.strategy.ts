import { Injectable } from '@nestjs/common';
import FacebookTokenStrategy from 'passport-facebook-token';
import { use } from 'passport';
import { AuthService } from './services/auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.init();
  }
  init(): void {
    use(
      new FacebookTokenStrategy(
        {
          clientID: this.configService.get<string>('FACEBOOK_CLIENT_ID'),
          clientSecret: this.configService.get<string>(
            'FACEBOOK_CLIENT_SECRET',
          ),
        },
        async (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: any,
        ): Promise<any> => {
          const user = await this.authService.signInOrCreateBySocialProvider(
            profile,
            'facebook',
          );
          return done(null, user);
        },
      ),
    );
  }
}
