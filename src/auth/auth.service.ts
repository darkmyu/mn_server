import { EnvironmentVariables } from '@/config/interface/config.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { AuthInfoResponse } from './dto/auth-info-response.dto';
import { AuthRegisterRequest } from './dto/auth-register-request.dto';
import { OAuthUser, TokenPayload } from './interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async info(user: User | null) {
    const animals = await this.prisma.animal.findMany({
      where: {
        userId: user?.id,
      },
      include: {
        user: true,
        breed: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return new AuthInfoResponse(user, animals);
  }

  async register(oauthUser: OAuthUser, request: AuthRegisterRequest) {
    await this.checkDuplicateUsername(request.username);

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

  async verifyRefreshToken(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
    });

    return payload;
  }

  async generateAccessToken(payload: TokenPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', { infer: true }),
      secret: this.configService.get('JWT_SECRET', { infer: true }),
    });

    return accessToken;
  }

  async generateRefreshToken(payload: TokenPayload) {
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', { infer: true }),
      secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
    });

    return refreshToken;
  }

  async generateRegisterToken(payload: OAuthUser) {
    const registerToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REGISTER_EXPIRES_IN', { infer: true }),
      secret: this.configService.get('JWT_REGISTER_SECRET', { infer: true }),
    });

    return registerToken;
  }

  async checkDuplicateUsername(username: string) {
    const exists = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (exists) {
      throw new ConflictException('username already exists');
    }
  }
}
