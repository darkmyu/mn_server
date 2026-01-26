import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { FileResponse } from '@/file/dto/file-response.dto';
import { ProfileResponse } from '@/profile/dto/profile-response.dto';
import { TagResponse } from '@/tag/dto/tag-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Photo, PhotoImage } from '@prisma/client';

export interface PhotoResponseParams {
  photo: Photo;
  image: PhotoImage;
  isLike: boolean;
  tags: TagResponse[];
  animals: AnimalResponse[];
  author: ProfileResponse;
}

export class PhotoResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  image: FileResponse;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  title: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  isLike: boolean;

  @ApiProperty({
    isArray: true,
    type: TagResponse,
  })
  tags: TagResponse[];

  @ApiProperty({
    isArray: true,
    type: AnimalResponse,
  })
  animals: AnimalResponse[];

  @ApiProperty()
  author: ProfileResponse;

  constructor({ photo, image, tags, isLike, animals, author }: PhotoResponseParams) {
    this.id = photo.id;
    this.title = photo.title;
    this.description = photo.description;
    this.likes = photo.likes;
    this.isLike = isLike;
    this.tags = tags;
    this.animals = animals;
    this.author = author;
    this.image = new FileResponse(image.path, image.size, image.width, image.height, image.mimetype);
  }
}
