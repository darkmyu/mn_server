import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

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
}

export class ProfileResponse extends UserResponse {
  @ApiProperty()
  isFollowing: boolean;

  @ApiProperty()
  followers: number;

  @ApiProperty()
  followings: number;

  constructor({ user }: ProfileResponseParams) {
    super({ user });
    this.isFollowing = user.followers.length > 0;
    this.followers = user._count.followers;
    this.followings = user._count.followings;
  }
}
