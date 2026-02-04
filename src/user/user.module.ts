import { ConverterModule } from '@/converter/converter.module';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ConverterModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
