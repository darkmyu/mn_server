import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthCheckDuplicateUsernameRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}
