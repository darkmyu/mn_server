import { ProfileResponse } from '@/profile/dto/profile-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PhotoComment } from '@prisma/client';

export interface PhotoCommentResponseParams {
  comment: PhotoComment;
  author: ProfileResponse;
  mention: ProfileResponse | null;
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

  constructor({ comment, mention, author }: PhotoCommentResponseParams) {
    this.id = comment.id;
    this.content = comment.content;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.parentId = comment.parentId;
    this.mention = mention;
    this.author = author;
  }
}
