import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
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
}
