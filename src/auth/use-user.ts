import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { authClient } from './client';
import type { User } from './server';

export const useUser = () => useSuspenseQuery(useUserQueryOptions);
export const useUserQueryOptions = queryOptions({
  queryKey: ['user'],
  queryFn: async () => {
    const session = await authClient.getSession();
    if (!session.data?.session) {
      const { data: anonymousData, error } = await authClient.signIn.anonymous();
      if (!anonymousData?.user) {
        throw new Error(`Failed to get user : ${error?.message}`);
      }
      return {
        ...anonymousData?.user,
        isAnonymous: true,
      };
    }
    return session.data.user;
  },
});

export function isUserAuthenticated(user: Partial<User>) {
  if (user.isAnonymous) {
    return false;
  }
  return !!user.email || !!user.name;
}
