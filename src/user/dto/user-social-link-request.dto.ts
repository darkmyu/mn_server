import { ApiProperty } from '@nestjs/swagger';
import { Social } from '@prisma/client';
import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';

export class UserSocialLinkRequest {
  @ApiProperty({
    enum: Social,
  })
  @IsEnum(Social)
  @IsNotEmpty()
  type: Social;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;
}
