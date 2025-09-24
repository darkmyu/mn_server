import { BreedResponse } from '@/breed/dto/breed-response.dto';
import { UserResponse } from '@/user/dto/user-response.dto';
import { Gender, Prisma } from '@prisma/client';

export class AnimalResponse {
  id: number;
  name: string;
  gender: Gender;
  birthday: Date | null;
  user: UserResponse;
  breed: BreedResponse;

  constructor(animal: Prisma.AnimalGetPayload<{ include: { user: true; breed: true } }>) {
    this.id = animal.id;
    this.name = animal.name;
    this.gender = animal.gender;
    this.birthday = animal.birthday;
    this.user = new UserResponse(animal.user);
    this.breed = new BreedResponse(animal.breed);
  }
}
