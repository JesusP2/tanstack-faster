import { createContext, useContext, useState } from 'react';
import { defaultPresets, type Preset } from '@/theme/theme-presets';

type Theme = 'light' | 'dark';
type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  preset: Preset;
  theme: Theme;
  setPreset: (presetName: Preset) => void;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  preset: 'mono',
  theme: 'dark',
  setPreset: () => null,
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const presetKey = 'preset';
const themeKey = 'theme';
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [preset, setPreset] = useState<Preset>(setPresetInDocument);
  const [theme, setTheme] = useState<Theme>(setThemeInDocument);

  const value = {
    preset,
    theme,
    setPreset: (preset: Preset) => {
      setCookie(presetKey, preset);
      setPresetInDocument();
      setPreset(preset);
    },
    setTheme: (theme: Theme) => {
      setCookie(themeKey, theme);
      setThemeInDocument();
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

function setThemeInDocument() {
  if (globalThis.document === undefined) {
    return initialState.theme;
  }
  let theme = getCookie(themeKey) as Theme;
  if (!theme) {
    theme = initialState.theme;
    setCookie(themeKey, theme);
  }
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  const preset = getCookie(presetKey) as Preset;
  setBodyProperties(preset ?? initialState.preset, theme);
  return theme;
}

function setPresetInDocument() {
  let presetName = getCookie(presetKey) as Preset;
  if (!presetName) {
    presetName = initialState.preset;
    setCookie(presetKey, presetName);
  }

  const theme = (getCookie(themeKey) as Theme) ?? initialState.theme;
  setBodyProperties(presetName, theme);
  return presetName;
}

function setCookie(key: string, value: string) {
  if (globalThis.document === undefined) return;
  localStorage.setItem(key, value);
}
function getCookie(key: keyof typeof initialState) {
  if (globalThis.document === undefined) {
    return initialState[key];
  }
  return localStorage.getItem(key);
}
