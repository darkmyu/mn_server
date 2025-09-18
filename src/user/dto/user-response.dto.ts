import { User } from '@prisma/client';

export class UserResponse {
  id: number;
  username: string;
  nickname: string;
  profileImage: string | null;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.profileImage = user.profileImage;
  }
}
