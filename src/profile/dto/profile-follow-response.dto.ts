import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export interface ProfileFollowResponseParams {
  user: User;
  isOwner: boolean;
  isFollowing: boolean;
}

export class ProfileFollowResponse {
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

  @ApiProperty()
  isOwner: boolean;

  @ApiProperty()
  isFollowing: boolean;

  constructor({ user, isOwner, isFollowing }: ProfileFollowResponseParams) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.thumbnail = user.thumbnail;
    this.isOwner = isOwner;
    this.isFollowing = isFollowing;
  }
}
