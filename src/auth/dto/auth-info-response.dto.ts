import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthInfoResponse {
  @ApiProperty()
  isAuthenticated: boolean;

  @ApiProperty({
    type: UserResponse,
    nullable: true,
  })
  user: UserResponse | null;

  constructor(isAuthenticated: boolean, user: User | null) {
    this.isAuthenticated = isAuthenticated;
    this.user = user ? new UserResponse(user) : null;
  }
}
