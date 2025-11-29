import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FileRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  width: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  height: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mimetype: string;
}
