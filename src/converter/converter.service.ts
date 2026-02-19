import { Injectable } from '@nestjs/common';
import * as heicConvert from 'heic-convert';
import * as path from 'path';

@Injectable()
export class ConverterService {
  async convertHeicToJpeg(file: Express.Multer.File): Promise<Express.Multer.File> {
    const extname = path.extname(file.originalname);

    if (!['.heic', '.heif'].includes(extname.toLowerCase())) {
      return file;
    }

    const converted = await heicConvert({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      buffer: file.buffer as any,
      format: 'JPEG',
      quality: 1,
    });

    const buffer = Buffer.from(converted);
    const originalname = `${path.basename(file.originalname, extname)}.jpeg`;

    return {
      ...file,
      buffer,
      originalname,
      size: buffer.length,
      mimetype: 'image/jpeg',
    };
  }
}
