import { ApiProperty } from '@nestjs/swagger';
import { Breed, Species } from '@prisma/client';

export class BreedResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    enum: Species,
  })
  species: Species;

  constructor(breed: Breed) {
    this.id = breed.id;
    this.name = breed.name;
    this.species = breed.species;
  }
}
