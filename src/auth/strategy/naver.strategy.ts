import { EnvironmentVariables } from '@/config/interface/config.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Provider } from '@prisma/client';
import { Profile, Strategy } from 'passport-naver';
import { AuthService } from '../auth.service';
import { OAuthUser } from '../interface/auth.interface';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {
    super({
      clientID: configService.get('NAVER_CLIENT_ID', { infer: true }),
      clientSecret: configService.get('NAVER_CLIENT_SECRET', { infer: true }),
      callbackURL: configService.get('NAVER_CALLBACK_URL', { infer: true }),
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const { id, email, profile_image } = profile._json;

    const oauthUser: OAuthUser = {
      email,
      provider: Provider.NAVER,
      providerId: id,
      thumbnail: profile_image,
    };

    const user = await this.authService.validateOAuthUser(oauthUser);
    return user;
  }
}
