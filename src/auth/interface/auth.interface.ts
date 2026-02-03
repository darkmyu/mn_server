import { Provider } from '@prisma/client';

export interface OAuthUser {
  email: string | null;
  provider: Provider;
  providerId: string;
  thumbnail: string | null;
}

export interface TokenPayload {
  id: number;
  username: string;
}
