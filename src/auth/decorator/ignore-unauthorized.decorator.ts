import { SetMetadata } from '@nestjs/common';

export const IgnoreUnauthorized = () => SetMetadata('ignoreUnauthorized', true);
