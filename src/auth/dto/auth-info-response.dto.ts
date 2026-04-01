import { UserSummaryResponse } from '@/user/dto/user-summary-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthInfoResponse {
  @ApiProperty({
    type: UserSummaryResponse,
    nullable: true,
  })
  profile: UserSummaryResponse | null;

  constructor(user: User | null) {
    this.profile = user ? new UserSummaryResponse({ user }) : null;
  }
}
