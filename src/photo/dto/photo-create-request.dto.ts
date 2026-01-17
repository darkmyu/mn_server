import { FileRequest } from '@/file/dto/file-request.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PhotoCreateRequest {
  @ApiProperty({
    isArray: true,
    type: 'number',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  animalIds: number[];

  @ApiProperty()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => FileRequest)
  image: FileRequest;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  title?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
