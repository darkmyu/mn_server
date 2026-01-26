import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PhotoCommentCreateRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'number',
  })
  @IsNumber()
  @IsOptional()
  parentId?: number | null;

  @ApiPropertyOptional({
    nullable: true,
    type: 'number',
  })
  @IsNumber()
  @IsOptional()
  mentionId?: number | null;
}
