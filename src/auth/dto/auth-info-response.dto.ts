import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AuthUserResponse } from './auth-user-response.dto';

export class AuthInfoResponse {
  @ApiProperty({
    type: AuthUserResponse,
    nullable: true,
  })
  profile: AuthUserResponse | null;

  constructor(user: User | null) {
    this.profile = user ? new AuthUserResponse(user) : null;
  }
}
