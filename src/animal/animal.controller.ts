import { GetUser } from '@/auth/decorator/get-user.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { AnimalService } from './animal.service';
import { AnimalCreateRequest } from './dto/animal-create-request.dto';

@Controller('animals')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Post()
  async create(@GetUser() user: User, @Body() request: AnimalCreateRequest) {
    return this.animalService.create(user, request);
  }
}
