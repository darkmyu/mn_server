import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './interface/config.interface';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {}

  get host() {
    return this.configService.get('NODE_ENV', { infer: true }) === 'production'
      ? 'https://mongnyang.com'
      : 'http://localhost:3000';
  }

  get domain() {
    return this.configService.get('NODE_ENV', { infer: true }) === 'production' ? '.mongnyang.com' : 'localhost';
  }

  get accessTokenMaxAge() {
    return 60 * 60 * 1000;
  }

  get registerTokenMaxAge() {
    return 60 * 60 * 1000;
  }

  get refreshTokenMaxAge() {
    return 60 * 60 * 1000 * 24 * 7;
  }
}
