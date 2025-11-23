import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class ConverterService {
  async convertHeicToJpeg(file: Express.Multer.File): Promise<Express.Multer.File> {
    const extname = path.extname(file.originalname);

    if (!['.heic', '.heif'].includes(extname.toLowerCase())) {
      return file;
    }

    const buffer = await sharp(file.buffer).jpeg().toBuffer();
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
