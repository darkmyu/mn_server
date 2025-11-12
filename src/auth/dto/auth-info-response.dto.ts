import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthInfoResponse {
  @ApiProperty({
    nullable: true,
    type: UserResponse,
  })
  user: UserResponse | null;

  constructor(user: User | null) {
    this.user = user ? new UserResponse(user) : null;
  }
}
