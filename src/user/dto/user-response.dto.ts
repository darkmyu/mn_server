import { ApiProperty } from '@nestjs/swagger';
import { Provider, User } from '@prisma/client';

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
  thumbnail: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  about: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    enum: Provider,
  })
  provider: Provider;

  constructor({ user }: UserResponseParams) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.thumbnail = user.thumbnail;
    this.about = user.about;
    this.email = user.email;
    this.provider = user.provider;
  }
}
