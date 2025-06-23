import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterRequest {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
