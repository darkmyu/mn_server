import { ProfileResponse } from '@/profile/dto/profile-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';

export interface PhotoCommentResponseParams {
  comment: Prisma.PhotoCommentGetPayload<{
    include: {
      user: {
        include: {
          followers: true;
          _count: {
            select: {
              followers: true;
              followings: true;
            };
          };
        };
      };
      mention: {
        include: {
          followers: true;
          _count: {
            select: {
              followers: true;
              followings: true;
            };
          };
        };
      };
    };
  }>;
  user: User | null;
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

  @ApiProperty()
  author: ProfileResponse;

  constructor({ comment, user }: PhotoCommentResponseParams) {
    this.id = comment.id;
    this.content = comment.content;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.parentId = comment.parentId;
    this.mention = comment.mention
      ? new ProfileResponse({ user: comment.mention, isOwner: comment.mentionId === user?.id })
      : null;
    this.author = new ProfileResponse({ user: comment.user, isOwner: comment.userId === user?.id });
  }
}
