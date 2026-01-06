import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
import { ConverterService } from '@/converter/converter.service';
import { FileService } from '@/file/file.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PhotoCreateRequest } from './dto/photo-create-request.dto';
import { PhotoListQuery, PhotoSort } from './dto/photo-list-query.dto';
import { PhotoResponse } from './dto/photo-response.dto';
import { PhotoUpdateRequest } from './dto/photo-update-request.dto';

@Injectable()
export class PhotoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly converterService: ConverterService,
  ) {}

  async all(query: PhotoListQuery) {
    const { cursor, limit, sort } = query;

    const [total, photos] = await this.prisma.$transaction([
      this.prisma.photo.count(),
      this.prisma.photo.findMany({
        include: {
          user: true,
          photoImage: true,
          animal: {
            include: {
              user: true,
              breed: true,
            },
          },
          photoTags: {
            include: {
              tag: true,
            },
          },
        },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: sort === PhotoSort.POPULAR ? [{ score: 'desc' }, { id: 'desc' }] : [{ id: 'desc' }],
      }),
    ]);

    const hasNextPage = photos.length > limit;
    if (hasNextPage) {
      photos.pop();
    }

    const items = photos.map((photo) => new PhotoResponse(photo));
    const nextCursor = hasNextPage ? photos[photos.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async read(id: number, user: User) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        photoImage: true,
        animal: {
          include: {
            user: true,
            breed: true,
          },
        },
        photoTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    if (photo.userId !== user.id) {
      throw new UnauthorizedException('you are not the owner of this photo');
    }

    return new PhotoResponse(photo);
  }

  async create(user: User, request: PhotoCreateRequest) {
    const animal = await this.prisma.animal.findUnique({
      where: {
        id: request.animalId,
      },
    });

    if (!animal) {
      throw new NotFoundException('animal is not found');
    }

    if (animal.userId !== user.id) {
      throw new UnauthorizedException('you are not the owner of this animal');
    }

    const photo = await this.prisma.photo.create({
      data: {
        userId: user.id,
        animalId: request.animalId,
        photoImage: {
          create: {
            path: request.image.path,
            size: request.image.size,
            width: request.image.width,
            height: request.image.height,
            mimetype: request.image.mimetype,
          },
        },
        title: request.title,
        description: request.description,
        ...(request.tags && {
          photoTags: {
            create: request.tags.map((name) => {
              const slug = name.toLowerCase().replace(/\s+/g, '-');

              return {
                tag: {
                  connectOrCreate: {
                    where: { slug },
                    create: { name, slug },
                  },
                },
              };
            }),
          },
        }),
      },
      include: {
        user: true,
        photoImage: true,
        animal: {
          include: {
            user: true,
            breed: true,
          },
        },
        photoTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return new PhotoResponse(photo);
  }

  async update(id: number, user: User, request: PhotoUpdateRequest) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    if (photo.userId !== user.id) {
      throw new UnauthorizedException('you are not the owner of this photo');
    }

    const updatedPhoto = await this.prisma.photo.update({
      where: {
        id,
      },
      data: {
        userId: user.id,
        animalId: request.animalId,
        photoImage: {
          update: {
            path: request.image.path,
            size: request.image.size,
            width: request.image.width,
            height: request.image.height,
            mimetype: request.image.mimetype,
          },
        },
        title: request.title,
        description: request.description,
        ...(request.tags && {
          photoTags: {
            deleteMany: {},
            create: request.tags.map((name) => {
              const slug = name.toLowerCase().replace(/\s+/g, '-');

              return {
                tag: {
                  connectOrCreate: {
                    where: { slug },
                    create: { name, slug },
                  },
                },
              };
            }),
          },
        }),
      },
      include: {
        user: true,
        photoImage: true,
        animal: {
          include: {
            user: true,
            breed: true,
          },
        },
        photoTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return new PhotoResponse(updatedPhoto);
  }

  async upload(image: Express.Multer.File) {
    const converted = await this.converterService.convertHeicToJpeg(image);
    const key = this.fileService.generateKey({ prefix: 'photos', file: converted });

    return this.fileService.upload(key, converted);
  }
}
