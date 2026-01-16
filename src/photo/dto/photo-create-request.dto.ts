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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
