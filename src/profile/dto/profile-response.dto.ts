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
      socialLinks: true;
    };
  }>;
  viewer: User | null;
}

export class ProfileResponse {
  @ApiProperty()
  isFollowing: boolean;

  @ApiProperty()
  followers: number;

  @ApiProperty()
  followings: number;

  @ApiProperty()
  isOwner: boolean;

  @ApiProperty({
    type: UserResponse,
  })
  profile: UserResponse;

  constructor({ user, viewer }: ProfileResponseParams) {
    this.isFollowing = user.followers.length > 0;
    this.followers = user._count.followers;
    this.followings = user._count.followings;
    this.isOwner = user.id === viewer?.id;
    this.profile = new UserResponse({ user });
  }
}
