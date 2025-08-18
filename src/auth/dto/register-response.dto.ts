import { User } from '@prisma/client';

export class RegisterResponse {
  id: number;
  username: string;
  nickname: string;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.profileImage = user.profileImage;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
