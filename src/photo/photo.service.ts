import { AlgorithmService } from '@/algorithm/algorithm.service';
import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
import { ConverterService } from '@/converter/converter.service';
import { FileService } from '@/file/file.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ProfileResponse } from '@/profile/dto/profile-response.dto';
import { TagResponse } from '@/tag/dto/tag-response.dto';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PhotoCommentCreateRequest } from './dto/photo-comment-create-request.dto';
import { PhotoCommentResponse } from './dto/photo-comment-response.dto';
import { PhotoCommentUpdateRequest } from './dto/photo-comment-update-request.dto';
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
          image: photo.photoImage!,
          tags: photo.photoTags.map(({ tag }) => new TagResponse({ tag })),
          isLike: photo.photoLikes.length > 0,
          animals: photo.photoAnimals.map(
            ({ animal }) =>
              new AnimalResponse({
                animal,
                user: animal.user,
                breed: animal.breed,
              }),
          ),
          author: new ProfileResponse({
            user: photo.user,
            isFollowing: photo.user.followers.length > 0,
            followers: photo.user._count.followers,
            followings: photo.user._count.followings,
            isOwner: photo.userId === user?.id,
          }),
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
      image: photo.photoImage!,
      tags: photo.photoTags.map(({ tag }) => new TagResponse({ tag })),
      isLike: photo.photoLikes.length > 0,
      animals: photo.photoAnimals.map(
        ({ animal }) =>
          new AnimalResponse({
            animal,
            user: animal.user,
            breed: animal.breed,
          }),
      ),
      author: new ProfileResponse({
        user: photo.user,
        isFollowing: photo.user.followers.length > 0,
        followers: photo.user._count.followers,
        followings: photo.user._count.followings,
        isOwner: photo.userId === user?.id,
      }),
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
      image: photo.photoImage!,
      tags: photo.photoTags.map(({ tag }) => new TagResponse({ tag })),
      isLike: photo.photoLikes.length > 0,
      animals: photo.photoAnimals.map(
        ({ animal }) =>
          new AnimalResponse({
            animal,
            user: animal.user,
            breed: animal.breed,
          }),
      ),
      author: new ProfileResponse({
        user: photo.user,
        isFollowing: photo.user.followers.length > 0,
        followers: photo.user._count.followers,
        followings: photo.user._count.followings,
        isOwner: photo.userId === user?.id,
      }),
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
      image: updatedPhoto.photoImage!,
      tags: updatedPhoto.photoTags.map(({ tag }) => new TagResponse({ tag })),
      isLike: updatedPhoto.photoLikes.length > 0,
      animals: updatedPhoto.photoAnimals.map(
        ({ animal }) =>
          new AnimalResponse({
            animal,
            user: animal.user,
            breed: animal.breed,
          }),
      ),
      author: new ProfileResponse({
        user: updatedPhoto.user,
        isFollowing: updatedPhoto.user.followers.length > 0,
        followers: updatedPhoto.user._count.followers,
        followings: updatedPhoto.user._count.followings,
        isOwner: updatedPhoto.userId === user?.id,
      }),
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
      photo,
      image: deletedPhoto.photoImage!,
      tags: deletedPhoto.photoTags.map(({ tag }) => new TagResponse({ tag })),
      isLike: deletedPhoto.photoLikes.length > 0,
      animals: deletedPhoto.photoAnimals.map(
        ({ animal }) =>
          new AnimalResponse({
            animal,
            user: animal.user,
            breed: animal.breed,
          }),
      ),
      author: new ProfileResponse({
        user: deletedPhoto.user,
        isFollowing: deletedPhoto.user.followers.length > 0,
        followers: deletedPhoto.user._count.followers,
        followings: deletedPhoto.user._count.followings,
        isOwner: deletedPhoto.userId === user?.id,
      }),
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

  async createComment(id: number, user: User, request: PhotoCommentCreateRequest) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    if (request.parentId) {
      const parent = await this.prisma.photoComment.findUnique({
        where: {
          id: request.parentId,
        },
      });

      if (!parent) {
        throw new NotFoundException('parent comment is not found');
      }

      if (parent.photoId !== id) {
        throw new NotFoundException('parent comment does not belong to this photo');
      }
    }

    const comment = await this.prisma.photoComment.create({
      data: {
        photoId: id,
        userId: user.id,
        content: request.content,
        parentId: request.parentId,
        mentionId: request.mentionId,
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
        mention: {
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
      },
    });

    return new PhotoCommentResponse({
      comment,
      author: new ProfileResponse({
        user: comment.user,
        isFollowing: comment.user.followers.length > 0,
        followers: comment.user._count.followers,
        followings: comment.user._count.followings,
        isOwner: comment.userId === user.id,
      }),
      mention: comment.mention
        ? new ProfileResponse({
            user: comment.mention,
            isFollowing: comment.mention.followers.length > 0,
            followers: comment.mention._count.followers,
            followings: comment.mention._count.followings,
            isOwner: comment.mentionId === user.id,
          })
        : null,
    });
  }

  async updateComment(id: number, commentId: number, user: User, request: PhotoCommentUpdateRequest) {
    const comment = await this.prisma.photoComment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('comment is not found');
    }

    if (comment.photoId !== id) {
      throw new NotFoundException('comment does not belong to this photo');
    }

    if (comment.userId !== user.id) {
      throw new UnauthorizedException('you are not the owner of this comment');
    }

    const updatedComment = await this.prisma.photoComment.update({
      where: {
        id: commentId,
      },
      data: {
        content: request.content,
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
        mention: {
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
      },
    });

    return new PhotoCommentResponse({
      comment,
      author: new ProfileResponse({
        user: updatedComment.user,
        isFollowing: updatedComment.user.followers.length > 0,
        followers: updatedComment.user._count.followers,
        followings: updatedComment.user._count.followings,
        isOwner: updatedComment.userId === user.id,
      }),
      mention: updatedComment.mention
        ? new ProfileResponse({
            user: updatedComment.mention,
            isFollowing: updatedComment.mention.followers.length > 0,
            followers: updatedComment.mention._count.followers,
            followings: updatedComment.mention._count.followings,
            isOwner: updatedComment.mentionId === user.id,
          })
        : null,
    });
  }

  async deleteComment(id: number, commentId: number, user: User) {
    const comment = await this.prisma.photoComment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('comment is not found');
    }

    if (comment.photoId !== id) {
      throw new NotFoundException('comment does not belong to this photo');
    }

    if (comment.userId !== user.id) {
      throw new UnauthorizedException('you are not the owner of this comment');
    }

    const deletedComment = await this.prisma.photoComment.delete({
      where: {
        id: commentId,
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
        mention: {
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
      },
    });

    return new PhotoCommentResponse({
      comment,
      author: new ProfileResponse({
        user: deletedComment.user,
        isFollowing: deletedComment.user.followers.length > 0,
        followers: deletedComment.user._count.followers,
        followings: deletedComment.user._count.followings,
        isOwner: deletedComment.userId === user.id,
      }),
      mention: deletedComment.mention
        ? new ProfileResponse({
            user: deletedComment.mention,
            isFollowing: deletedComment.mention.followers.length > 0,
            followers: deletedComment.mention._count.followers,
            followings: deletedComment.mention._count.followings,
            isOwner: deletedComment.mentionId === user.id,
          })
        : null,
    });
  }

  async upload(image: Express.Multer.File) {
    const converted = await this.converterService.convertHeicToJpeg(image);
    const key = this.fileService.generateKey({ prefix: 'photos', file: converted });

    return this.fileService.upload(key, converted);
  }
}
