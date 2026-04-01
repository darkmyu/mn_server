import { ApiProperty } from '@nestjs/swagger';
import { Social, UserSocialLink } from '@prisma/client';

export interface UserSocialLinkResponseParams {
  socialLink: UserSocialLink;
}

export class UserSocialLinkResponse {
  @ApiProperty({
    enum: Social,
  })
  type: Social;

  @ApiProperty()
  url: string;

  constructor({ socialLink }: UserSocialLinkResponseParams) {
    this.type = socialLink.type;
    this.url = socialLink.url;
  }
}
