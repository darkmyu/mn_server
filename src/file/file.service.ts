import { EnvironmentVariables } from '@/config/interface/config.interface';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mime from 'mime';
import { nanoid } from 'nanoid';

interface KeyParams {
  prefix: 'animals';
  entityId: number;
  file: Express.Multer.File;
}

@Injectable()
export class FileService {
  private readonly R2: S3Client;
  private readonly R2_URL: string;
  private readonly R2_BUCKET: string;

  constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {
    this.R2 = new S3Client({
      region: this.configService.get('R2_REGION', { infer: true }),
      endpoint: this.configService.get('R2_ENDPOINT', { infer: true }),
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_KEY', { infer: true }),
        secretAccessKey: this.configService.get('R2_SECRET_KEY', { infer: true }),
      },
    });
    this.R2_URL = this.configService.get('R2_URL', { infer: true });
    this.R2_BUCKET = this.configService.get('R2_BUCKET', { infer: true });
  }

  async upload(key: string, file: Express.Multer.File) {
    await this.R2.send(
      new PutObjectCommand({
        Bucket: this.R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.R2_URL}/${key}`;
  }

  generateKey({ prefix, entityId, file }: KeyParams) {
    const extension = mime.getExtension(file.mimetype);
    if (!extension) {
      throw new BadRequestException('unsupported file type');
    }

    return `${prefix}/${entityId}/${nanoid()}.${extension}`;
  }
}
