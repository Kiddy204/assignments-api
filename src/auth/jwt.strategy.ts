import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ENCRYPTION_KEY'),
    });
  }

  async validate(payload: any): Promise<any> {
    // console.log('payload', payload);
    // const user = await this.userService.getUserById(payload.id);
    // return { userId: payload.sub, username: payload.username };
    return { userId: payload.id, username: payload.login };
  }
}
