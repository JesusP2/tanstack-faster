import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { authClient } from '@/auth/client';
import type { User } from '@/auth/server';

export const useUser = () => useSuspenseQuery(useUserQueryOptions());
export const useUserQueryOptions = () =>
  queryOptions({
    queryKey: ['session'],
    queryFn: async () => {
      let jwt = null;
      const session = await authClient.getSession({
        fetchOptions: {
          onSuccess: (ctx) => {
            jwt = ctx.response.headers.get('set-auth-jwt');
          },
        },
      });
      if (!session.data?.session) {
        const { data: anonymousData } = await authClient.signIn.anonymous();
        if (!anonymousData?.user) {
          throw new Error('Failed to get user');
        }
        return {
          ...anonymousData?.user,
          isAnonymous: true,
          jwt: null,
        };
      }
      return {
        ...session.data.user,
        jwt,
      };
    },
  });

export function isUserAuthenticated(user: Partial<User>) {
  if (user.isAnonymous) {
    return false;
  }
  return !!user.email || !!user.name;
}
