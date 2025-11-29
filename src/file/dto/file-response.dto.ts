import { ApiProperty } from '@nestjs/swagger';

export class FileResponse {
  @ApiProperty()
  path: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  mimetype: string;

  constructor(path: string, size: number, width: number, height: number, mimetype: string) {
    this.path = path;
    this.size = size;
    this.width = width;
    this.height = height;
    this.mimetype = mimetype;
  }
}
