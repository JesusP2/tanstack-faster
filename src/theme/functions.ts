import { createServerFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import {
  defaultPresets,
  defaults,
  type Preset,
  presetKey,
  type Theme,
  themeKey,
} from '@/theme/constants';

export const getThemeServerFn = createServerFn().handler(async () => {
  const theme = (getCookie(themeKey) ?? defaults.theme) as Theme;
  const preset = (getCookie(presetKey) ?? defaults.preset) as Preset;
  const presetProperties = objectEntries(defaultPresets[preset].styles[theme]);
  return {
    theme,
    preset,
    presetProperties: presetProperties as Record<string, string>,
  };
});

const objectEntries = <T extends Record<string, unknown>>(obj: T) => {
  const properties = {} as Record<ToCssProperty<keyof T>, T[keyof T]>;
  for (const key in obj) {
    properties[`--${key}` as ToCssProperty<keyof T>] = obj[key as keyof T];
  }
  return properties;
};

type ToCssProperty<T> = T extends string ? `--${T}` : never;
