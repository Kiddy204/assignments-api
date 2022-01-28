import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../services/auth/auth.service';
import { UserDaoService } from '../../user/services/user-dao/user-dao.service';

@Injectable()
export class RoleGuard extends AuthGuard('jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly userDao: UserDaoService,
    private readonly reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const token = this.authService.getTokenFromHeaders(req.headers);
    if (!token) {
      return false;
    }
    const userPayload = this.authService.validateToken(token);
    if (userPayload && userPayload.id) {
      const user = await this.userDao.getUserById(userPayload.id);
      if (!user) {
        return false;
      }
      req.user = user;
      const hasRole = () =>
        roles.includes(user.role.toString()) ? true : false;
      return user && hasRole();
    }
    return false;
  }
}
