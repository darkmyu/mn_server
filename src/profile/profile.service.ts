import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
import { PhotoResponse } from '@/photo/dto/photo-response.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ProfileFollowResponse } from './dto/profile-follow-response.dto';
import { ProfileResponse } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async read(username: string, viewer: User | null) {
    const user = await this.prisma.user.findUnique({
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
            followerId: viewer ? viewer.id : -1,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('user is not found');
    }

    return new ProfileResponse({ user, viewer });
  }

  async animals(username: string, query: CursorPaginationQuery) {
    const { cursor, limit } = query;

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
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : Prisma.skip,
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    const hasNextPage = animals.length > limit;
    if (hasNextPage) {
      animals.pop();
    }

    const items = animals.map((animal) => new AnimalResponse({ animal }));
    const nextCursor = hasNextPage ? animals[animals.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async photos(username: string, query: CursorPaginationQuery, viewer: User | null) {
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
                  followerId: viewer ? viewer.id : -1,
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
              userId: viewer ? viewer.id : -1,
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

    const items = photos.map((photo) => new PhotoResponse({ photo, viewer }));
    const nextCursor = hasNextPage ? photos[photos.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async photo(username: string, id: number, viewer: User | null) {
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
                followerId: viewer ? viewer.id : -1,
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
            userId: viewer ? viewer.id : -1,
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    return new PhotoResponse({ photo, viewer });
  }

  async followers(username: string, query: CursorPaginationQuery, viewer: User | null) {
    const { cursor, limit } = query;

    const target = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!target) {
      throw new NotFoundException('target is not found');
    }

    const [total, followers] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: {
          followings: {
            some: {
              followingId: target.id,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        where: {
          followings: {
            some: {
              followingId: target.id,
            },
          },
        },
        include: {
          followers: {
            where: {
              followerId: viewer ? viewer.id : -1,
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

    const hasNextPage = followers.length > limit;
    if (hasNextPage) followers.pop();

    const items = followers.map(
      (follower) =>
        new ProfileFollowResponse({
          user: follower,
          isOwner: follower.id === viewer?.id,
          isFollowing: follower.followers.length > 0,
        }),
    );

    const nextCursor = hasNextPage ? followers[followers.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async followings(username: string, query: CursorPaginationQuery, viewer: User | null) {
    const { cursor, limit } = query;

    const target = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!target) {
      throw new NotFoundException('target is not found');
    }

    const [total, followings] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: {
          followers: {
            some: {
              followerId: target.id,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        where: {
          followers: {
            some: {
              followerId: target.id,
            },
          },
        },
        include: {
          followers: {
            where: {
              followerId: viewer ? viewer.id : -1,
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

    const hasNextPage = followings.length > limit;
    if (hasNextPage) followings.pop();

    const items = followings.map(
      (following) =>
        new ProfileFollowResponse({
          user: following,
          isOwner: following.id === viewer?.id,
          isFollowing: following.followers.length > 0,
        }),
    );

    const nextCursor = hasNextPage ? followings[followings.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async follow(username: string, viewer: User) {
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
        followerId: viewer.id,
        followingId: target.id,
      },
    });

    return new ProfileFollowResponse({
      user: target,
      isOwner: false,
      isFollowing: true,
    });
  }

  async unfollow(username: string, viewer: User) {
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
          followerId: viewer.id,
          followingId: target.id,
        },
      },
    });

    return new ProfileFollowResponse({
      user: target,
      isOwner: false,
      isFollowing: false,
    });
  }
}
