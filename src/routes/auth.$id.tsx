import { AuthView } from '@daveyplate/better-auth-ui';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from "@/components/link";
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export const Route = createFileRoute('/auth/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return (
    <main className="mx-auto grid h-screen max-w-6xl place-items-center space-y-6 p-6">
      <Link
        className={buttonVariants({
          variant: 'ghost',
          className: 'absolute top-4 left-4',
        })}
        to="/"
      >
        <ArrowLeft className="h-4 w-4" />
        Go back
      </Link>
      <AuthView pathname={id} />
    </main>
  );
}
