import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export interface ProfileResponseParams {
  user: Prisma.UserGetPayload<{
    include: {
      followers: true;
      _count: {
        select: {
          followers: true;
          followings: true;
        };
      };
    };
  }>;
  isOwner: boolean;
}

export class ProfileResponse {
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

  @ApiProperty()
  followers: number = 0;

  @ApiProperty()
  followings: number = 0;

  @ApiProperty()
  isFollowing: boolean = false;

  @ApiProperty()
  isOwner: boolean = false;

  constructor({ user, isOwner }: ProfileResponseParams) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.profileImage = user.profileImage;
    this.followers = user._count.followers;
    this.followings = user._count.followings;
    this.isFollowing = user.followers.length > 0;
    this.isOwner = isOwner;
  }
}
