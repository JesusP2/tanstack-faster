import { useRef } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { MoonIcon } from '@/components/ui/moon';
import { SunIcon } from '@/components/ui/sun';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme/provider';

export interface IconRef {
  startAnimation: () => void;
  stopAnimation: () => void;
}

const themeButtonId = 'theme-button';
export function ThemeButton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const { theme: mode, setTheme } = useTheme();
  const moonRef = useRef<IconRef>(null);
  const sunRef = useRef<IconRef>(null);

  function handleMouseEnter() {
    moonRef.current?.startAnimation();
    sunRef.current?.startAnimation();
  }

  function handleMouseLeave() {
    moonRef.current?.stopAnimation();
    sunRef.current?.stopAnimation();
  }

  return (
    <>
      <div
        className={cn('flex flex-col justify-center', className)}
        style={style}
      >
        <input
          checked={mode === 'dark'}
          className="peer sr-only"
          id={themeButtonId}
          name={themeButtonId}
          onChange={(e) => {
            setTheme(e.target.checked ? 'dark' : 'light');
          }}
          type="checkbox"
        />
        <label
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'relative right-[1px] size-8 cursor-pointer select-none hover:bg-opacity-0 active:bg-opacity-0'
          )}
          htmlFor={themeButtonId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          suppressHydrationWarning
        >
          <MoonIcon
            aria-hidden="true"
            className="shrink-0 scale-0 opacity-0 transition-all hover:bg-opacity-0 active:bg-opacity-0 dark:scale-100 dark:opacity-100"
            ref={moonRef}
            size={16}
          />
          <SunIcon
            aria-hidden="true"
            className="absolute shrink-0 scale-100 opacity-100 transition-all hover:bg-opacity-0 active:bg-opacity-0 dark:scale-0 dark:opacity-0"
            ref={sunRef}
            size={16}
          />
        </label>
      </div>
    </>
  );
}
