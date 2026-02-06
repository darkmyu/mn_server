import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class AnimalCreateRequest {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  breedId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string;

  @ApiProperty({
    enum: Gender,
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  birthday: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  thumbnail?: string | null = null;
}
