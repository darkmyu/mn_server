import { UserSummaryResponse } from '@/user/dto/user-summary-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';

export interface PhotoCommentResponseParams {
  comment: Prisma.PhotoCommentGetPayload<{
    include: {
      user: true;
      mention: true;
      _count: {
        select: {
          replies: true;
        };
      };
    };
  }>;
  viewer: User | null;
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
  author: UserSummaryResponse;

  @ApiProperty({
    type: 'number',
    nullable: true,
  })
  parentId: number | null;

  @ApiProperty({
    type: UserSummaryResponse,
    nullable: true,
  })
  mention: UserSummaryResponse | null;

  @ApiProperty()
  replyCount: number;

  @ApiProperty()
  isOwner: boolean;

  constructor({ comment, viewer }: PhotoCommentResponseParams) {
    this.id = comment.id;
    this.content = comment.content;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.author = new UserSummaryResponse({ user: comment.user });
    this.parentId = comment.parentId;
    this.mention = comment.mention ? new UserSummaryResponse({ user: comment.mention }) : null;
    this.replyCount = comment._count.replies;
    this.isOwner = comment.user.id === viewer?.id;
  }
}
