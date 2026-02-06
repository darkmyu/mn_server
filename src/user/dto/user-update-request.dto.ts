import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
