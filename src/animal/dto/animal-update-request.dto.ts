import { PartialType } from '@nestjs/mapped-types';
import { AnimalCreateRequest } from './animal-create-request.dto';

export class AnimalUpdateRequest extends PartialType(AnimalCreateRequest) {}
