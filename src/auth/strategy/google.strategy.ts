import { AuthService } from '@/auth/auth.service';
import { OAuthUser } from '@/auth/interface/auth.interface';
import { EnvironmentVariables } from '@/config/interface/config.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Provider } from '@prisma/client';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID', { infer: true }),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET', { infer: true }),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL', { infer: true }),
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const { sub, email, picture } = profile._json;

    const oauthUser: OAuthUser = {
      email: email ?? null,
      provider: Provider.GOOGLE,
      providerId: sub,
      profileImage: picture ?? null,
    };

    const user = await this.authService.validateOAuthUser(oauthUser);
    return user;
  }
}
