import { ApiProperty } from '@nestjs/swagger';
import { Prisma, Provider } from '@prisma/client';
import { UserSocialLinkResponse } from './user-social-link-response.dto';
import { UserSummaryResponse } from './user-summary-response.dto';

interface UserResponseParams {
  user: Prisma.UserGetPayload<{
    include: {
      socialLinks: true;
    };
  }>;
}

export class UserResponse extends UserSummaryResponse {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  about: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    enum: Provider,
  })
  provider: Provider;

  @ApiProperty({
    type: [UserSocialLinkResponse],
  })
  socialLinks: UserSocialLinkResponse[];

  constructor({ user }: UserResponseParams) {
    super({ user });
    this.about = user.about;
    this.email = user.email;
    this.provider = user.provider;
    this.socialLinks = user.socialLinks.map((socialLink) => new UserSocialLinkResponse({ socialLink }));
  }
}
