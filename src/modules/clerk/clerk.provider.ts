import { createClerkClient } from '@clerk/backend';
import { EnvService } from 'src/shared/env/env.service';

export const CLERK_TOKEN = 'CLERK_TOKEN';

export const ClerkClientProvider = {
  provide: 'ClerkClient',
  useFactory: (env: EnvService) => {
    return createClerkClient({
      publishableKey: env.get('CLERK_PUBLISHABLE_KEY'),
      secretKey: env.get('CLERK_SECRET_KEY'),
    });
  },
  inject: [EnvService],
};
