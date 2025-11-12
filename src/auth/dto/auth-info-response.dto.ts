import { ProfileResponse } from '@/profile/dto/profile-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthInfoResponse {
  @ApiProperty({
    nullable: true,
    type: ProfileResponse,
  })
  profile: ProfileResponse | null;

  constructor(user: User | null) {
    this.profile = user ? new ProfileResponse(user) : null;
  }
}
