import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthInfoResponse {
  @ApiProperty({
    type: UserResponse,
    nullable: true,
  })
  profile: UserResponse | null;

  constructor(user: User | null) {
    this.profile = user ? new UserResponse(user) : null;
  }
}
