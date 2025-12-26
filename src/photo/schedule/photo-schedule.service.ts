import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { updatePhotosScore } from '@prisma/client/sql';

@Injectable()
export class PhotoScheduleService {
  private readonly logger = new Logger(PhotoScheduleService.name);

  private readonly GRAVITY = 0.8;
  private readonly ALL_MIN_SCORE = 0.001;
  private readonly POPULAR_MIN_SCORE = 0.5;

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async updateAllRanking() {
    this.logger.log('[All] Calculate photo score scheduler start');

    const photos = await this.prisma.$queryRawTyped(updatePhotosScore(this.GRAVITY, this.ALL_MIN_SCORE));

    this.logger.log(`[All] Calculate photo score scheduler end (count: ${photos.length})`);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updatePopularRanking() {
    this.logger.log('[Popular] Calculate photo score scheduler start');

    const photos = await this.prisma.$queryRawTyped(updatePhotosScore(this.GRAVITY, this.POPULAR_MIN_SCORE));

    this.logger.log(`[Popular] Calculate photo score scheduler end (count: ${photos.length})`);
  }
}
