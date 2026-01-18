import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class ProfileResponse extends UserResponse {
  @ApiProperty()
  followers: number = 0;

  @ApiProperty()
  followings: number = 0;

  @ApiProperty()
  isFollowing: boolean = false;

  constructor(user: User, followers: number, followings: number, isFollowing: boolean) {
    super(user);
    this.followers = followers;
    this.followings = followings;
    this.isFollowing = isFollowing;
  }
}
