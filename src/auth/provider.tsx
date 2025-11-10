import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack';
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack';
import { Link, useRouter } from '@tanstack/react-router';
import { authClient } from '@/auth/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        authClient={authClient}
        captcha={{
          siteKey: import.meta.env.VITE_TURNSTILE_SITEKEY,
          provider: 'cloudflare-turnstile',
        }}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
        magicLink
        navigate={(href) => router.navigate({ href })}
        passkey
        replace={(href) => router.navigate({ href, replace: true })}
        social={{
          providers: ['google'],
        }}
      >
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
}
