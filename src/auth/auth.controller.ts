import { AppConfigService } from '@/config/app-config.service';
import { UserResponse } from '@/user/dto/user-response.dto';
import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './decorator/get-user.decorator';
import { IgnoreUnauthorized } from './decorator/ignore-unauthorized.decorator';
import { Public } from './decorator/public.decorator';
import { AuthCheckDuplicateUsernameRequest } from './dto/auth-check-duplicate-username-request.dto';
import { AuthInfoResponse } from './dto/auth-info-response.dto';
import { AuthRegisterRequest } from './dto/auth-register-request.dto';
import { OAuthUser } from './interface/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @Get('info')
  @IgnoreUnauthorized()
  info(@GetUser() user: User | null) {
    return new AuthInfoResponse(!!user, user);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async google() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@GetUser() user: User | OAuthUser, @Res() res: Response) {
    return this.socialCallback(user, res);
  }

  @Public()
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naver() {}

  @Public()
  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverCallback(@GetUser() user: User | OAuthUser, @Res() res: Response) {
    return this.socialCallback(user, res);
  }

  @Public()
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakao() {}

  @Public()
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(@GetUser() user: User | OAuthUser, @Res() res: Response) {
    return this.socialCallback(user, res);
  }

  @Public()
  @Post('register')
  @UseGuards(AuthGuard('jwt-register'))
  async register(
    @GetUser() oauthUser: OAuthUser,
    @Body() request: AuthRegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(oauthUser, request);
    await this.setRefreshTokenCookie(res, user);

    return new UserResponse(user);
  }

  @Public()
  @HttpCode(200)
  @Post('check-duplicate-username')
  async checkDuplicateUsername(@Body() request: AuthCheckDuplicateUsernameRequest) {
    await this.authService.checkDuplicateUsername(request.username);
  }

  @Post('logout')
  logout(@Res() res: Response) {
    return res.clearCookie('access_token').clearCookie('refresh_token').send();
  }

  private async socialCallback(user: User | OAuthUser, res: Response) {
    const host = this.appConfigService.host;

    if ('id' in user) {
      await this.setAccessTokenCookie(res, user);
      await this.setRefreshTokenCookie(res, user);

      return res.redirect(host);
    }

    await this.setRegisterTokenCookie(res, user);

    return res.redirect(`${host}/onboarding`);
  }

  private setCookie(res: Response, name: string, token: string, options: CookieOptions) {
    res.cookie(name, token, {
      httpOnly: true,
      domain: this.appConfigService.domain,
      ...options,
    });
  }

  private async setAccessTokenCookie(res: Response, user: User) {
    const accessToken = await this.authService.generateAccessToken({
      id: user.id,
      username: user.username,
    });

    this.setCookie(res, 'access_token', accessToken, {
      maxAge: this.appConfigService.accessTokenMaxAge,
    });
  }

  private async setRefreshTokenCookie(res: Response, user: User) {
    const refreshToken = await this.authService.generateRefreshToken({
      id: user.id,
      username: user.username,
    });

    this.setCookie(res, 'refresh_token', refreshToken, {
      maxAge: this.appConfigService.refreshTokenMaxAge,
    });
  }

  private async setRegisterTokenCookie(res: Response, oauthUser: OAuthUser) {
    const registerToken = await this.authService.generateRegisterToken(oauthUser);

    this.setCookie(res, 'register_token', registerToken, {
      maxAge: this.appConfigService.registerTokenMaxAge,
    });
  }
}
