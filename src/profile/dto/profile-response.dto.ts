import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export interface ProfileResponseParams {
  user: User;
  isFollowing: boolean;
  followers: number;
  followings: number;
  isOwner: boolean;
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

  constructor({ user, isFollowing, followers, followings, isOwner }: ProfileResponseParams) {
    super({ user });
    this.isFollowing = isFollowing;
    this.followers = followers;
    this.followings = followings;
    this.isOwner = isOwner;
  }
}
