import { IsNotEmpty, IsString } from 'class-validator';

export class AuthCheckDuplicateUsernameRequest {
  @IsString()
  @IsNotEmpty()
  username: string;
}
