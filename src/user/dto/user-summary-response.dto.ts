import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

interface UserSummaryResponseParams {
  user: User;
}

export class UserSummaryResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  thumbnail: string | null;

  constructor({ user }: UserSummaryResponseParams) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.thumbnail = user.thumbnail;
  }
}
