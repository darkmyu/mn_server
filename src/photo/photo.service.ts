import { AlgorithmService } from '@/algorithm/algorithm.service';
import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
import { FileService } from '@/file/file.service';
import { PrismaService } from '@/prisma/prisma.service';
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
    private readonly algorithmService: AlgorithmService,
  ) {}

  async all(query: PhotoListQuery, viewer: User | null) {
    const { cursor, limit, sort, tag } = query;

    const where: Prisma.PhotoWhereInput = {};

    if (tag) {
      where.photoTags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      };
    }

    const [total, photos] = await this.prisma.$transaction([
      this.prisma.photo.count({ where }),
      this.prisma.photo.findMany({
        where,
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
                  followerId: viewer ? viewer.id : -1,
                },
              },
              socialLinks: true,
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
              userId: viewer ? viewer.id : -1,
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

    const items = photos.map((photo) => new PhotoResponse({ photo, viewer }));
    const nextCursor = hasNextPage ? photos[photos.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async read(id: number, viewer: User) {
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
                followerId: viewer.id,
              },
            },
            socialLinks: true,
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
            userId: viewer.id,
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    if (photo.userId !== viewer.id) {
      throw new UnauthorizedException('you are not the owner of this photo');
    }

    return new PhotoResponse({ photo, viewer });
  }

  async create(viewer: User, request: PhotoCreateRequest) {
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

    const isOwnedAnimals = animals.every((animal) => animal.userId === viewer.id);
    if (!isOwnedAnimals) {
      throw new UnauthorizedException('you are not the owner of some animals');
    }

    const photo = await this.prisma.photo.create({
      data: {
        userId: viewer.id,
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
                followerId: viewer.id,
              },
            },
            socialLinks: true,
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
            userId: viewer.id,
          },
        },
      },
    });

    return new PhotoResponse({ photo, viewer });
  }

  async update(id: number, viewer: User, request: PhotoUpdateRequest) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    if (photo.userId !== viewer.id) {
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

    const isOwnedAnimals = animals.every((animal) => animal.userId === viewer.id);
    if (!isOwnedAnimals) {
      throw new UnauthorizedException('you are not the owner of some animals');
    }

    const updatedPhoto = await this.prisma.photo.update({
      where: {
        id,
      },
      data: {
        userId: viewer.id,
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
                followerId: viewer.id,
              },
            },
            socialLinks: true,
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
            userId: viewer.id,
          },
        },
      },
    });

    return new PhotoResponse({ photo: updatedPhoto, viewer });
  }

  async delete(id: number, viewer: User) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    if (photo.userId !== viewer.id) {
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
                followerId: viewer.id,
              },
            },
            socialLinks: true,
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
            userId: viewer.id,
          },
        },
      },
    });

    return new PhotoResponse({ photo: deletedPhoto, viewer });
  }

  async like(id: number, viewer: User) {
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
          userId: viewer.id,
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

  async unlike(id: number, viewer: User) {
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
            userId: viewer.id,
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

  async getComments(id: number, query: CursorPaginationQuery, viewer: User | null) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    const { cursor, limit } = query;

    const [total, comments] = await this.prisma.$transaction([
      this.prisma.photoComment.count({
        where: {
          photoId: id,
        },
      }),
      this.prisma.photoComment.findMany({
        where: {
          photoId: id,
          parentId: null,
        },
        include: {
          user: true,
          mention: true,
          _count: {
            select: {
              replies: true,
            },
          },
        },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : Prisma.skip,
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    const hasNextPage = comments.length > limit;
    if (hasNextPage) {
      comments.pop();
    }

    const items = comments.map((comment) => new PhotoCommentResponse({ comment, viewer }));
    const nextCursor = hasNextPage ? comments[comments.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async getReplies(id: number, commentId: number, query: CursorPaginationQuery, viewer: User | null) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    const parent = await this.prisma.photoComment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!parent) {
      throw new NotFoundException('parent comment is not found');
    }

    if (parent.photoId !== id) {
      throw new NotFoundException('parent comment does not belong to this photo');
    }

    const { cursor, limit } = query;

    const [total, comments] = await this.prisma.$transaction([
      this.prisma.photoComment.count({
        where: {
          parentId: commentId,
        },
      }),
      this.prisma.photoComment.findMany({
        where: {
          parentId: commentId,
        },
        include: {
          user: true,
          mention: true,
          _count: {
            select: {
              replies: true,
            },
          },
        },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : Prisma.skip,
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    const hasNextPage = comments.length > limit;
    if (hasNextPage) {
      comments.pop();
    }

    const items = comments.map((comment) => new PhotoCommentResponse({ comment, viewer }));
    const nextCursor = hasNextPage ? comments[comments.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async createComment(id: number, viewer: User, request: PhotoCommentCreateRequest) {
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
        userId: viewer.id,
        content: request.content,
        parentId: request.parentId,
        mentionId: request.mentionId,
      },
      include: {
        user: true,
        mention: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return new PhotoCommentResponse({ comment, viewer });
  }

  async updateComment(id: number, commentId: number, viewer: User, request: PhotoCommentUpdateRequest) {
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

    if (comment.userId !== viewer.id) {
      throw new UnauthorizedException('you are not the owner of this comment');
    }

    const updatedComment = await this.prisma.photoComment.update({
      where: {
        id: commentId,
      },
      data: {
        content: request.content,
        parentId: request.parentId,
        mentionId: request.mentionId,
      },
      include: {
        user: true,
        mention: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return new PhotoCommentResponse({ comment: updatedComment, viewer });
  }

  async deleteComment(id: number, commentId: number, viewer: User) {
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

    if (comment.userId !== viewer.id) {
      throw new UnauthorizedException('you are not the owner of this comment');
    }

    const deletedComment = await this.prisma.photoComment.delete({
      where: {
        id: commentId,
      },
      include: {
        user: true,
        mention: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return new PhotoCommentResponse({ comment: deletedComment, viewer });
  }

  async upload(image: Express.Multer.File) {
    const key = this.fileService.generateKey({ prefix: 'photos', file: image });
    return this.fileService.upload(key, image);
  }
}
