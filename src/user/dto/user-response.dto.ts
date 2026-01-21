import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

interface UserResponseParams {
  user: User;
}

export class UserResponse {
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

  constructor({ user }: UserResponseParams) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.profileImage = user.profileImage;
  }
}
