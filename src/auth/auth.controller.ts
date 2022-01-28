import { UserDaoService } from './../user/services/user-dao/user-dao.service';
import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserRole } from '../user/models/user-role';
import { JwtPayload } from '../auth/models'
import { AuthService } from './services/auth/auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';

interface AuthQuery {
  access_token: string;
  role: UserRole;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserDaoService,
    private readonly authService: AuthService
    ) {}

  @Post()
  async login(
    email: string,
    password: string,
  ): Promise<JwtPayload> {
    let input
    input.email=email
    input.password=password

    if (input.email) {
      const isValid = await this.authService.validateUserByEmail(
        input.email,
        input.password,
      );
      if (isValid) {
        return await this.authService.signInUserWithEmail(input.email);
      }
      throw new HttpException(
        `Invalid email / password combination`,
        HttpStatus.BAD_REQUEST,
      );
    } else if (input.phone) {
      const isValid = await this.authService.validateUserByPhone(
        input.phone,
        input.password,
      );
      if (isValid) {
        return await this.authService.signInUserWithPhone(input.phone);
      }
      throw new HttpException(
        `Invalid phone / password combination`,
        HttpStatus.BAD_REQUEST,
      );
    } else {
      throw new HttpException(
        `You need to specify an email or a phone`,
        HttpStatus.BAD_REQUEST,
      );
    }

  }

}
