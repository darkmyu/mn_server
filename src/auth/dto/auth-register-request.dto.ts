import { IsNotEmpty, IsString } from 'class-validator';

export class AuthRegisterRequest {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
