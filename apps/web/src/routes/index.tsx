import { useLiveQuery } from '@tanstack/react-db';
import { createFileRoute } from '@tanstack/react-router';
import { ThemeButton } from '@/theme/theme-button';
import ThemePresetSelect from '@/theme/theme-preset-select';
import { todosCollection } from '@/todos/collection';
import { TodosForm } from '@/todos/form';
import { TodosList } from '@/todos/list';

export const Route = createFileRoute('/')({
  component: HomeComponent,
  ssr: false,
});

function HomeComponent() {
  const query = useLiveQuery((q) => q.from({ todosCollection }));
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <header className="mb-4">
        <h1 className="font-bold text-2xl">Test Template</h1>
        <ThemeButton />
      </header>
      <div>
        <ThemePresetSelect />
      </div>
      <TodosForm />
      <TodosList todos={query.data} />
    </div>
  );
}
