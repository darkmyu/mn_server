import { ProfileResponse } from '@/profile/dto/profile-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export interface PhotoCommentResponseParams {
  comment: Prisma.PhotoCommentGetPayload<{
    include: {
      user: {
        include: {
          _count: {
            select: {
              followers: true;
              followings: true;
            };
          };
          followers: true;
        };
      };
      mention: {
        include: {
          _count: {
            select: {
              followers: true;
              followings: true;
            };
          };
          followers: true;
        };
      };
    };
  }>;
}

export class PhotoCommentResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  author: ProfileResponse;

  @ApiProperty({
    type: 'number',
    nullable: true,
  })
  parentId: number | null;

  @ApiProperty({
    type: ProfileResponse,
    nullable: true,
  })
  mention: ProfileResponse | null;

  constructor({ comment }: PhotoCommentResponseParams) {
    this.id = comment.id;
    this.content = comment.content;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.author = new ProfileResponse({ user: comment.user });
    this.parentId = comment.parentId;
    this.mention = comment.mention ? new ProfileResponse({ user: comment.mention }) : null;
  }
}
