import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class ProfileResponse extends UserResponse {
  @ApiProperty()
  isFollowing: boolean = false;

  @ApiProperty()
  followers: number = 0;

  @ApiProperty()
  followings: number = 0;

  constructor(
    user: Prisma.UserGetPayload<{
      include: {
        _count: {
          select: {
            followers: true;
            followings: true;
          };
        };
      };
    }>,
    isFollowing: boolean,
  ) {
    super(user);
    this.isFollowing = isFollowing;
    this.followers = user._count.followers;
    this.followings = user._count.followings;
  }
}
