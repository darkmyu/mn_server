import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthUserResponse {
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
  profileImage: string | null;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.profileImage = user.profileImage;
  }
}
