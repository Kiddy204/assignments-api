import { UserRole } from '../../user/models/user-role';

export interface JwtPayload {
  login: string;
  id: string;
  role: UserRole;
  expiresIn: number;
  token: string;
}
