export interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_REGISTER_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  JWT_REGISTER_EXPIRES_IN: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
  NAVER_CALLBACK_URL: string;
  KAKAO_CLIENT_ID: string;
  KAKAO_CLIENT_SECRET: string;
  KAKAO_CALLBACK_URL: string;
  R2_URL: string;
  R2_REGION: string;
  R2_BUCKET: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY: string;
  R2_SECRET_KEY: string;
}
