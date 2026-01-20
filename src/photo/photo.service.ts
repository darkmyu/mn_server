import { AlgorithmService } from '@/algorithm/algorithm.service';
import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
import { ConverterService } from '@/converter/converter.service';
import { FileService } from '@/file/file.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
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
    private readonly algorithmService: AlgorithmService,
  ) {}

  async all(query: PhotoListQuery, user: User | null) {
    const { cursor, limit, sort } = query;

    const [total, photos] = await this.prisma.$transaction([
      this.prisma.photo.count(),
      this.prisma.photo.findMany({
        include: {
          user: {
            include: {
              _count: {
                select: {
                  followers: true,
                  followings: true,
                },
              },
              followers: {
                where: {
                  followerId: user ? user.id : -1,
                },
              },
            },
          },
          photoImage: true,
          photoAnimals: {
            include: {
              animal: {
                include: {
                  user: true,
                  breed: true,
                },
              },
            },
          },
          photoTags: {
            include: {
              tag: true,
            },
          },
          photoLikes: {
            where: {
              userId: user ? user.id : -1,
            },
          },
        },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : Prisma.skip,
        orderBy: sort === PhotoSort.POPULAR ? [{ score: 'desc' }, { id: 'desc' }] : [{ id: 'desc' }],
      }),
    ]);

    const hasNextPage = photos.length > limit;
    if (hasNextPage) {
      photos.pop();
    }

    const items = photos.map(
      (photo) =>
        new PhotoResponse({
          photo,
          image: photo.photoImage,
          author: photo.user,
          tags: photo.photoTags.map(({ tag }) => tag),
          animals: photo.photoAnimals.map(({ animal }) => animal),
          liked: photo.photoLikes.length > 0,
          followers: photo.user._count.followers,
          followings: photo.user._count.followings,
          isFollowing: photo.user.followers.length > 0,
        }),
    );

    const nextCursor = hasNextPage ? photos[photos.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async read(id: number, user: User) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          include: {
            _count: {
              select: {
                followers: true,
                followings: true,
              },
            },
            followers: {
              where: {
                followerId: user ? user.id : -1,
              },
            },
          },
        },
        photoImage: true,
        photoAnimals: {
          include: {
            animal: {
              include: {
                user: true,
                breed: true,
              },
            },
          },
        },
        photoTags: {
          include: {
            tag: true,
          },
        },
        photoLikes: {
          where: {
            userId: user.id,
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

    return new PhotoResponse({
      photo,
      image: photo.photoImage,
      author: photo.user,
      tags: photo.photoTags.map(({ tag }) => tag),
      animals: photo.photoAnimals.map(({ animal }) => animal),
      liked: photo.photoLikes.length > 0,
      followers: photo.user._count.followers,
      followings: photo.user._count.followings,
      isFollowing: photo.user.followers.length > 0,
    });
  }

  async create(user: User, request: PhotoCreateRequest) {
    const animals = await this.prisma.animal.findMany({
      where: {
        id: {
          in: request.animalIds,
        },
      },
    });

    if (animals.length !== request.animalIds.length) {
      throw new NotFoundException('one or more animals are not found');
    }

    const isOwnedAnimals = animals.every((animal) => animal.userId === user.id);
    if (!isOwnedAnimals) {
      throw new UnauthorizedException('you are not the owner of some animals');
    }

    const photo = await this.prisma.photo.create({
      data: {
        userId: user.id,
        photoAnimals: {
          create: request.animalIds.map((animalId) => ({
            animalId,
          })),
        },
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
        user: {
          include: {
            _count: {
              select: {
                followers: true,
                followings: true,
              },
            },
            followers: {
              where: {
                followerId: user ? user.id : -1,
              },
            },
          },
        },
        photoImage: true,
        photoAnimals: {
          include: {
            animal: {
              include: {
                user: true,
                breed: true,
              },
            },
          },
        },
        photoTags: {
          include: {
            tag: true,
          },
        },
        photoLikes: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    return new PhotoResponse({
      photo,
      image: photo.photoImage,
      author: photo.user,
      tags: photo.photoTags.map(({ tag }) => tag),
      animals: photo.photoAnimals.map(({ animal }) => animal),
      liked: photo.photoLikes.length > 0,
      followers: photo.user._count.followers,
      followings: photo.user._count.followings,
      isFollowing: photo.user.followers.length > 0,
    });
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

    const animals = await this.prisma.animal.findMany({
      where: {
        id: {
          in: request.animalIds,
        },
      },
    });

    if (animals.length !== request.animalIds.length) {
      throw new NotFoundException('one or more animals are not found');
    }

    const isOwnedAnimals = animals.every((animal) => animal.userId === user.id);
    if (!isOwnedAnimals) {
      throw new UnauthorizedException('you are not the owner of some animals');
    }

    const updatedPhoto = await this.prisma.photo.update({
      where: {
        id,
      },
      data: {
        userId: user.id,
        photoAnimals: {
          deleteMany: {},
          create: request.animalIds.map((animalId) => ({
            animalId,
          })),
        },
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
        user: {
          include: {
            _count: {
              select: {
                followers: true,
                followings: true,
              },
            },
            followers: {
              where: {
                followerId: user ? user.id : -1,
              },
            },
          },
        },
        photoImage: true,
        photoAnimals: {
          include: {
            animal: {
              include: {
                user: true,
                breed: true,
              },
            },
          },
        },
        photoTags: {
          include: {
            tag: true,
          },
        },
        photoLikes: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    return new PhotoResponse({
      photo,
      image: updatedPhoto.photoImage,
      author: updatedPhoto.user,
      tags: updatedPhoto.photoTags.map(({ tag }) => tag),
      animals: updatedPhoto.photoAnimals.map(({ animal }) => animal),
      liked: updatedPhoto.photoLikes.length > 0,
      followers: updatedPhoto.user._count.followers,
      followings: updatedPhoto.user._count.followings,
      isFollowing: updatedPhoto.user.followers.length > 0,
    });
  }

  async delete(id: number, user: User) {
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

    const deletedPhoto = await this.prisma.photo.delete({
      where: {
        id,
      },
      include: {
        user: {
          include: {
            _count: {
              select: {
                followers: true,
                followings: true,
              },
            },
            followers: {
              where: {
                followerId: user.id,
              },
            },
          },
        },
        photoImage: true,
        photoAnimals: {
          include: {
            animal: {
              include: {
                user: true,
                breed: true,
              },
            },
          },
        },
        photoTags: {
          include: {
            tag: true,
          },
        },
        photoLikes: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    return new PhotoResponse({
      photo: deletedPhoto,
      image: deletedPhoto.photoImage,
      author: deletedPhoto.user,
      tags: deletedPhoto.photoTags.map(({ tag }) => tag),
      animals: deletedPhoto.photoAnimals.map(({ animal }) => animal),
      liked: deletedPhoto.photoLikes.length > 0,
      followers: deletedPhoto.user._count.followers,
      followings: deletedPhoto.user._count.followings,
      isFollowing: deletedPhoto.user.followers.length > 0,
    });
  }

  async like(id: number, user: User) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.photoLike.create({
        data: {
          userId: user.id,
          photoId: photo.id,
        },
      });

      const { likes } = await tx.photo.update({
        where: {
          id,
        },
        data: {
          likes: {
            increment: 1,
          },
        },
        select: {
          likes: true,
        },
      });

      const score = this.algorithmService.calculateScore(likes, photo.createdAt);

      await tx.photo.update({
        where: {
          id,
        },
        data: {
          score,
        },
      });
    });
  }

  async unlike(id: number, user: User) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.photoLike.delete({
        where: {
          userId_photoId: {
            userId: user.id,
            photoId: id,
          },
        },
      });

      const { likes } = await tx.photo.update({
        where: {
          id,
        },
        data: {
          likes: {
            decrement: 1,
          },
        },
        select: {
          likes: true,
        },
      });

      const score = this.algorithmService.calculateScore(likes, photo.createdAt);

      await tx.photo.update({
        where: {
          id,
        },
        data: {
          score,
        },
      });
    });
  }

  async upload(image: Express.Multer.File) {
    const converted = await this.converterService.convertHeicToJpeg(image);
    const key = this.fileService.generateKey({ prefix: 'photos', file: converted });

    return this.fileService.upload(key, converted);
  }
}
