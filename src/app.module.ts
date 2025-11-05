import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AnimalModule } from './animal/animal.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { BreedModule } from './breed/breed.module';
import { AppConfigModule } from './config/app-config.module';
import { FileModule } from './file/file.module';
import { PhotoModule } from './photo/photo.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AppConfigModule, PrismaModule, FileModule, AuthModule, AnimalModule, UserModule, BreedModule, PhotoModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
