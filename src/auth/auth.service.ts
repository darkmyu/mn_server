import { EnvironmentVariables } from '@/config/interface/config.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterRequest } from './dto/register-request.dto';
import { OAuthUser, TokenPayload } from './interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async register(oauthUser: OAuthUser, request: RegisterRequest) {
    const exists = await this.prisma.user.findFirst({
      where: {
        username: request.username,
      },
    });

    if (exists) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email: oauthUser.email,
        nickname: request.nickname,
        username: request.username,
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
        profileImage: oauthUser.profileImage,
      },
    });

    return user;
  }

  async findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async validateOAuthUser(oauthUser: OAuthUser) {
    const user = await this.prisma.user.findFirst({
      where: {
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
      },
    });

    if (!user) return oauthUser;
    return user;
  }

  async generateTokens(payload: TokenPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', { infer: true }),
      secret: this.configService.get('JWT_SECRET', { infer: true }),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', { infer: true }),
      secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
    });

    return { accessToken, refreshToken };
  }

  async generateRegisterToken(payload: OAuthUser) {
    const registerToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REGISTER_EXPIRES_IN', { infer: true }),
      secret: this.configService.get('JWT_REGISTER_SECRET', { infer: true }),
    });

    return registerToken;
  }
}
