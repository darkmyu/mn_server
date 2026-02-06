import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class PhotoCommentCreateRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'number',
  })
  @IsNumber()
  @IsOptional()
  parentId: number | null = null;

  @ApiPropertyOptional({
    nullable: true,
    type: 'number',
  })
  @IsNumber()
  @IsOptional()
  mentionId: number | null = null;
}
