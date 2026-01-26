import { BreedResponse } from '@/breed/dto/breed-response.dto';
import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Animal, Breed, Gender, User } from '@prisma/client';

export interface AnimalResponseParams {
  animal: Animal;
  user: User;
  breed: Breed;
}

export class AnimalResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    enum: Gender,
  })
  gender: Gender;

  @ApiProperty({
    type: Date,
  })
  birthday: Date;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  thumbnail: string | null;

  @ApiProperty()
  owner: UserResponse;

  @ApiProperty()
  breed: BreedResponse;

  constructor({ animal, user, breed }: AnimalResponseParams) {
    this.id = animal.id;
    this.name = animal.name;
    this.gender = animal.gender;
    this.birthday = animal.birthday;
    this.thumbnail = animal.thumbnail;
    this.owner = new UserResponse({ user });
    this.breed = new BreedResponse({ breed });
  }
}
