import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AnimalCreateRequest {
  @IsNumber()
  @IsNotEmpty()
  breedId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: Gender,
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsDateString()
  @IsOptional()
  birthday?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;
}
