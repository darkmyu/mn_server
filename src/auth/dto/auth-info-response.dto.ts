import { UserResponse } from '@/user/dto/user-response.dto';
import { User } from '@prisma/client';

export class AuthInfoResponse {
  isAuthenticated: boolean;
  user?: UserResponse;

  constructor(isAuthenticated: boolean, user: User | null) {
    this.isAuthenticated = isAuthenticated;
    this.user = user ? new UserResponse(user) : undefined;
  }
}
