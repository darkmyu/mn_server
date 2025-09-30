import { ApiProperty } from '@nestjs/swagger';

export class FileResponse {
  @ApiProperty()
  path: string;

  constructor(path: string) {
    this.path = path;
  }
}
