import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { FileResponse } from '@/file/dto/file-response.dto';
import { ProfileResponse } from '@/profile/dto/profile-response.dto';
import { TagResponse } from '@/tag/dto/tag-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Photo, PhotoImage, Prisma, Tag, User } from '@prisma/client';

interface Params {
  photo: Photo;
  image: PhotoImage | null;
  author: User;
  tags: Tag[];
  animals: Prisma.AnimalGetPayload<{ include: { user: true; breed: true } }>[];
  liked: boolean;
  followers: number;
  followings: number;
  isFollowing: boolean;
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
  liked: boolean;

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

  constructor({ photo, image, author, tags, animals, liked, followers, followings, isFollowing }: Params) {
    this.id = photo.id;
    this.title = photo.title;
    this.description = photo.description;
    this.likes = photo.likes;
    this.liked = liked;
    this.tags = tags.map((tag) => new TagResponse(tag));
    this.animals = animals.map((animal) => new AnimalResponse(animal, animal.user, animal.breed));
    this.author = new ProfileResponse(author, followers, followings, isFollowing);

    if (image) {
      this.image = new FileResponse(image.path, image.size, image.width, image.height, image.mimetype);
    }
  }
}
