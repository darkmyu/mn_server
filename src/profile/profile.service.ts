import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
import { PaginationQuery } from '@/common/dto/pagination-query.dto';
import { Pagination } from '@/common/dto/pagination.dto';
import { PhotoResponse } from '@/photo/dto/photo-response.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ProfileFollowResponse } from './dto/profile-follow-response.dto';
import { ProfileResponse } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async read(username: string, user: User | null) {
    const target = await this.prisma.user.findUnique({
      where: {
        username,
      },
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
    });

    if (!target) {
      throw new NotFoundException('target is not found');
    }

    return new ProfileResponse(target, target._count.followers, target._count.followings, target.followers.length > 0);
  }

  async animals(username: string, query: PaginationQuery) {
    const { page, limit } = query;

    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('user is not found');
    }

    const [total, animals] = await this.prisma.$transaction([
      this.prisma.animal.count({
        where: {
          userId: user.id,
        },
      }),
      this.prisma.animal.findMany({
        where: {
          userId: user.id,
        },
        include: {
          user: true,
          breed: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    const items = animals.map((animal) => new AnimalResponse(animal, animal.user, animal.breed));
    const hasNextPage = page * limit < total;

    return new Pagination(items, page, total, limit, hasNextPage);
  }

  async photos(username: string, query: CursorPaginationQuery, user: User | null) {
    const { cursor, limit } = query;

    const author = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!author) {
      throw new NotFoundException('author is not found');
    }

    const [total, photos] = await this.prisma.$transaction([
      this.prisma.photo.count({
        where: {
          userId: author.id,
        },
      }),
      this.prisma.photo.findMany({
        where: {
          userId: author.id,
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
              userId: user ? user.id : -1,
            },
          },
        },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : Prisma.skip,
        orderBy: {
          id: 'desc',
        },
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

  async photo(username: string, id: number, user: User | null) {
    const author = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!author) {
      throw new NotFoundException('author is not found');
    }

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
            userId: user ? user.id : -1,
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
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

  async follow(username: string, user: User) {
    const target = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!target) {
      throw new NotFoundException('target is not found');
    }

    await this.prisma.userFollow.create({
      data: {
        followerId: user.id,
        followingId: target.id,
      },
    });

    return new ProfileFollowResponse(true);
  }

  async unfollow(username: string, user: User) {
    const target = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!target) {
      throw new NotFoundException('target is not found');
    }

    await this.prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: target.id,
        },
      },
    });

    return new ProfileFollowResponse(false);
  }
}
