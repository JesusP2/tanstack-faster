import { EmailTemplate } from '@daveyplate/better-auth-ui/server';

export const magicLinkTemplate = (url: string, BASE_URL: string) =>
  EmailTemplate({
    action: 'Sign in',
    heading: 'Sign in to your account',
    siteName: 'Template',
    imageUrl: `${BASE_URL}/favicon.ico`,
    baseUrl: BASE_URL,
    url,
    content: (
      <>
        <p>Hello,</p>
        <p>
          We received a login request for your account. If you initiated this
          request, please use the following magic link to securely access your
          account:
        </p>
        <p>
          <a href="">Login Securely</a>
        </p>
        <p>(This magic link will expire 5 minutes after it was sent.)</p>
        <p>
          If you did not initiate this login request, you can ignore this email.
        </p>
      </>
    ),
  });
