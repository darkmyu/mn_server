import { ConverterModule } from '@/converter/converter.module';
import { Module } from '@nestjs/common';
import { AnimalController } from './animal.controller';
import { AnimalService } from './animal.service';

@Module({
  imports: [ConverterModule],
  controllers: [AnimalController],
  providers: [AnimalService],
})
export class AnimalModule {}
