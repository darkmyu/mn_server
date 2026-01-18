import { Provider } from '@prisma/client';

export interface OAuthUser {
  email: string | null;
  provider: Provider;
  providerId: string;
  profileImage: string | null;
}

export interface TokenPayload {
  id: number;
  username: string;
}
