import { createContext, useContext, useState } from 'react';
import {
  defaultPresets,
  defaults,
  type Preset,
  presetKey,
  type Theme,
  themeKey,
} from '@/theme/constants';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultPreset?: Preset;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  preset: Preset;
  theme: Theme;
  setPreset: (presetName: Preset) => void;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  preset: defaults.preset,
  theme: defaults.theme,
  setPreset: () => null,
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultPreset = initialState.preset,
  defaultTheme = initialState.theme,
  ...props
}: ThemeProviderProps) {
  const [preset, setPreset] = useState<Preset>(
    setPresetInDocument({
      defaultPreset,
      defaultTheme,
    })
  );
  const [theme, setTheme] = useState<Theme>(
    setThemeInDocument({
      defaultPreset,
      defaultTheme,
    })
  );

  const value = {
    preset,
    theme,
    setPreset: (preset: Preset) => {
      setCookie(presetKey, preset);
      setPresetInDocument({
        defaultPreset,
        defaultTheme,
      });
      setPreset(preset);
    },
    setTheme: (theme: Theme) => {
      setCookie(themeKey, theme);
      setThemeInDocument({
        defaultPreset,
        defaultTheme,
      });
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

function setBodyProperties(
  presetName: Preset,
  theme: Exclude<Theme, 'system'>
) {
  if (globalThis.document === undefined) return;
  const preset = defaultPresets[presetName];
  const styles = preset.styles[theme];
  Object.entries(styles).forEach(([key, value]) => {
    document.body.style.setProperty(`--${key}`, value);
  });
  return presetName;
}

function setThemeInDocument({
  defaultPreset,
  defaultTheme,
}: {
  defaultPreset: Preset;
  defaultTheme: Theme;
}) {
  if (globalThis.document === undefined) {
    return defaultTheme;
  }
  let theme = getCookie(themeKey, {
    preset: defaultPreset,
    theme: defaultTheme,
  }) as Theme;
  if (!theme) {
    theme = defaultTheme;
    setCookie(themeKey, theme);
  }
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  const preset = getCookie(presetKey, {
    preset: defaultPreset,
    theme: defaultTheme,
  }) as Preset;
  setBodyProperties(preset ?? defaultPreset, theme);
  return theme;
}

function setPresetInDocument({
  defaultPreset,
  defaultTheme,
}: {
  defaultPreset: Preset;
  defaultTheme: Theme;
}) {
  let presetName = getCookie(presetKey, {
    preset: defaultPreset,
    theme: defaultTheme,
  }) as Preset;
  if (!presetName) {
    presetName = defaultPreset;
    setCookie(presetKey, presetName);
  }

  const theme =
    (getCookie(themeKey, {
      preset: defaultPreset,
      theme: defaultTheme,
    }) as Theme) ?? defaultTheme;
  setBodyProperties(presetName, theme);
  return presetName;
}

function setCookie(key: string, value: string) {
  if (globalThis.document === undefined) return;
  document.cookie = `${key}=${value}`;
}
function getCookie(
  key: keyof typeof initialState,
  initialState: {
    preset: Preset;
    theme: Theme;
  }
) {
  if (globalThis.document === undefined) {
    return initialState[key];
  }
  const cookie = document.cookie.split('; ').find((c) => c.startsWith(key));
  return cookie ? cookie.split('=')[1] : null;
}
