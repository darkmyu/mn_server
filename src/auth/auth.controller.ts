import { AppConfigService } from '@/config/app-config.service';
import { Body, Controller, Get, HttpCode, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiExcludeEndpoint, ApiOkResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './decorator/get-user.decorator';
import { IgnoreUnauthorized } from './decorator/ignore-unauthorized.decorator';
import { Public } from './decorator/public.decorator';
import { AuthCheckDuplicateUsernameRequest } from './dto/auth-check-duplicate-username-request.dto';
import { AuthInfoResponse } from './dto/auth-info-response.dto';
import { AuthRegisterRequest } from './dto/auth-register-request.dto';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { KakaoAuthGuard } from './guard/kakao-auth.guard';
import { NaverAuthGuard } from './guard/naver-auth.guard';
import { OAuthUser } from './interface/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @ApiOkResponse({
    type: AuthInfoResponse,
  })
  @Get('info')
  @IgnoreUnauthorized()
  info(@GetUser() user: User | null) {
    return this.authService.info(user);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async google() {}

  @ApiExcludeEndpoint()
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@GetUser() user: User | OAuthUser, @Res() res: Response, @Query('state') state?: string) {
    return this.socialCallback(user, res, state);
  }

  @Public()
  @Get('naver')
  @UseGuards(NaverAuthGuard)
  async naver() {}

  @ApiExcludeEndpoint()
  @Public()
  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverCallback(@GetUser() user: User | OAuthUser, @Res() res: Response, @Query('state') state?: string) {
    return this.socialCallback(user, res, state);
  }

  @Public()
  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  async kakao() {}

  @ApiExcludeEndpoint()
  @Public()
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(@GetUser() user: User | OAuthUser, @Res() res: Response, @Query('state') state?: string) {
    return this.socialCallback(user, res, state);
  }

  @ApiOkResponse({
    type: AuthInfoResponse,
  })
  @Public()
  @Post('register')
  @UseGuards(AuthGuard('jwt-register'))
  async register(
    @GetUser() oauthUser: OAuthUser,
    @Body() request: AuthRegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(oauthUser, request);

    res.clearCookie('register_token');
    await this.setAccessTokenCookie(res, user);
    await this.setRefreshTokenCookie(res, user);

    return new AuthInfoResponse(user);
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

  private async socialCallback(user: User | OAuthUser, res: Response, state?: string) {
    const host = this.appConfigService.host;
    const redirectUrl = state || host;

    if ('id' in user) {
      await this.setAccessTokenCookie(res, user);
      await this.setRefreshTokenCookie(res, user);

      return res.redirect(redirectUrl);
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
