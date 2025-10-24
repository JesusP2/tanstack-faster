import { polarClient } from '@polar-sh/better-auth';
import {
  adminClient,
  anonymousClient,
  jwtClient,
  magicLinkClient,
  organizationClient,
  passkeyClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
  plugins: [
    polarClient(),
    jwtClient(),
    organizationClient(),
    anonymousClient(),
    magicLinkClient(),
    adminClient(),
    passkeyClient(),
    // oneTapClient({
    //   clientId: "YOUR_CLIENT_ID",
    //   // Optional client configuration:
    //   autoSelect: false,
    //   cancelOnTapOutside: true,
    //   context: "signin",
    //   additionalOptions: {
    //     // Any extra options for the Google initialize method
    //   },
    //   // Configure prompt behavior and exponential backoff:
    //   promptOptions: {
    //     baseDelay: 1000, // Base delay in ms (default: 1000)
    //     maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
    //   },
    // }),
  ],
});
