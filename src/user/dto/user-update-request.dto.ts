import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserUpdateRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  about?: string | null = null;
}
