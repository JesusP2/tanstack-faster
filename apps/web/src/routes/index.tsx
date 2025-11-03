import { createFileRoute } from '@tanstack/react-router';
import { ThemeButton } from '@/theme/theme-button';
import ThemePresetSelect from '@/theme/theme-preset-select';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <header className="mb-4">
        <h1 className="font-bold text-2xl">Test Template</h1>
        <ThemeButton />
      </header>
      <div>
        <ThemePresetSelect />
      </div>
    </div>
  );
}
