import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { UserSocialLinkRequest } from './user-social-link-request.dto';

export class UserUpdateRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nickname: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  about?: string | null = null;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  thumbnail?: string | null = null;

  @ApiProperty({
    type: [UserSocialLinkRequest],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserSocialLinkRequest)
  socialLinks: UserSocialLinkRequest[];
}
