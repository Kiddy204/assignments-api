import { CustomDecorator, SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]): CustomDecorator<any> =>
  SetMetadata('roles', roles);
