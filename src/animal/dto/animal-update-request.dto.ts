import { PartialType } from '@nestjs/swagger';
import { AnimalCreateRequest } from './animal-create-request.dto';

export class AnimalUpdateRequest extends PartialType(AnimalCreateRequest) {}
