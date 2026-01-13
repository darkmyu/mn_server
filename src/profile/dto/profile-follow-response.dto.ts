import { ApiProperty } from '@nestjs/swagger';

export class ProfileFollowResponse {
  @ApiProperty()
  isFollowing: boolean;

  constructor(isFollowing: boolean) {
    this.isFollowing = isFollowing;
  }
}
