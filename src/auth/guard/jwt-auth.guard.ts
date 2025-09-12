import { AppConfigService } from '@/config/app-config.service';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest<Request>();
    const isTokenExpired = info instanceof JsonWebTokenError && info.name === 'TokenExpiredError';
    const hasRefreshToken = !user && !!request.cookies['refresh_token'];

    if (isTokenExpired || hasRefreshToken) {
      return this.handleRefreshToken(context);
    }

    const ignoreUnauthorized = this.reflector.getAllAndOverride<boolean>('ignoreUnauthorized', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (ignoreUnauthorized) {
      return user || null;
    }

    if (err || !user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async handleRefreshToken(context: ExecutionContext): Promise<User> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const refreshToken = request.cookies['refresh_token'] as string;

    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const accessToken = await this.authService.generateAccessToken({
      id: payload.id,
      username: payload.username,
    });

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      domain: this.appConfigService.domain,
      maxAge: this.appConfigService.accessTokenMaxAge,
    });

    const user = await this.authService.findUserById(payload.id);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
