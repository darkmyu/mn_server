import { BreedResponse } from '@/breed/dto/breed-response.dto';
import { UserSummaryResponse } from '@/user/dto/user-summary-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, Prisma } from '@prisma/client';

export interface AnimalResponseParams {
  animal: Prisma.AnimalGetPayload<{
    include: {
      user: true;
      breed: true;
    };
  }>;
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
  owner: UserSummaryResponse;

  @ApiProperty()
  breed: BreedResponse;

  constructor({ animal }: AnimalResponseParams) {
    this.id = animal.id;
    this.name = animal.name;
    this.gender = animal.gender;
    this.birthday = animal.birthday;
    this.thumbnail = animal.thumbnail;
    this.owner = new UserSummaryResponse({ user: animal.user });
    this.breed = new BreedResponse({ breed: animal.breed });
  }
}
