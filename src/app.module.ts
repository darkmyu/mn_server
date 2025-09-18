import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AnimalModule } from './animal/animal.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AppConfigModule, PrismaModule, AuthModule, AnimalModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
