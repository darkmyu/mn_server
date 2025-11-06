import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';

export class AuthInfoResponse {
  @ApiProperty({
    nullable: true,
    type: UserResponse,
  })
  user: UserResponse | null;

  @ApiProperty({
    isArray: true,
    type: AnimalResponse,
  })
  animals: AnimalResponse[];

  constructor(user: User | null, animals: Prisma.AnimalGetPayload<{ include: { user: true; breed: true } }>[]) {
    this.user = user ? new UserResponse(user) : null;
    this.animals = animals.map((animal) => new AnimalResponse(animal));
  }
}
