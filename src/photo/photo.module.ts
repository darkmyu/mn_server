import { AlgorithmModule } from '@/algorithm/algorithm.module';
import { ConverterModule } from '@/converter/converter.module';
import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { PhotoScheduleService } from './schedule/photo-schedule.service';

@Module({
  imports: [ConverterModule, AlgorithmModule],
  controllers: [PhotoController],
  providers: [PhotoService, PhotoScheduleService],
})
export class PhotoModule {}
