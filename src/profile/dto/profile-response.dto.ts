import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';

export interface ProfileResponseParams {
  user: Prisma.UserGetPayload<{
    include: {
      _count: {
        select: {
          followers: true;
          followings: true;
        };
      };
      followers: true;
    };
  }>;
  viewer: User | null;
}

export class ProfileResponse extends UserResponse {
  @ApiProperty()
  isFollowing: boolean;

  @ApiProperty()
  followers: number;

  @ApiProperty()
  followings: number;

  @ApiProperty()
  isOwner: boolean;

  constructor({ user, viewer }: ProfileResponseParams) {
    super({ user });
    this.isFollowing = user.followers.length > 0;
    this.followers = user._count.followers;
    this.followings = user._count.followings;
    this.isOwner = user.id === viewer?.id;
  }
}
