import { Check, ChevronDown } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { defaultPresets, type Preset, presetsArray } from '@/theme/constants';
import { useTheme } from '@/theme/provider';

type ThemePresetSelectProps = React.ComponentProps<typeof Button>;

interface ColorBoxProps {
  color: string;
}

const ColorBox: React.FC<ColorBoxProps> = ({ color }) => (
  <div
    className="h-3 w-3 rounded-sm border border-muted"
    style={{ backgroundColor: color }}
  />
);

interface ThemeColorsProps {
  presetName: Preset;
  mode: 'light' | 'dark';
}

const ThemeColors: React.FC<ThemeColorsProps> = ({ presetName, mode }) => {
  const styles = defaultPresets[presetName].styles[mode];
  return (
    <div className="flex gap-0.5">
      <ColorBox color={styles.primary} />
      <ColorBox color={styles.accent} />
      <ColorBox color={styles.secondary} />
      <ColorBox color={styles.border} />
    </div>
  );
};

const ThemePresetSelect: React.FC<ThemePresetSelectProps> = ({
  className,
  ...props
}) => {
  const { preset, theme, setPreset } = useTheme();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const triggerButton = (
    <Button
      className={cn(
        'group relative w-full justify-between md:min-w-56',
        className
      )}
      id="theme-preset-select"
      variant="outline"
      {...props}
    >
      <div className="flex w-full items-center gap-3 overflow-hidden">
        <div className="flex gap-0.5">
          <ColorBox color={defaultPresets[preset].styles[theme].primary} />
          <ColorBox color={defaultPresets[preset].styles[theme].accent} />
          <ColorBox color={defaultPresets[preset].styles[theme].secondary} />
          <ColorBox color={defaultPresets[preset].styles[theme].border} />
        </div>
        <span className="truncate text-left font-medium capitalize">
          {defaultPresets[preset]?.label || preset}
        </span>
      </div>
      <ChevronDown className="size-4 shrink-0" />
    </Button>
  );

  const commandContent = (
    <Command className="max-h-96 w-full rounded-lg border shadow-md">
      <div className="flex w-full items-center">
        <div className="flex w-full items-center border-b px-3 py-1">
          <CommandInput
            className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search presets..."
          />
        </div>
      </div>
      <Separator />
      <CommandList className="chat-scrollbar">
        <CommandEmpty>No themes found.</CommandEmpty>
        <CommandGroup heading="Built-in Themes">
          {presetsArray.map(({ label }) => {
            const presetName = Object.entries(defaultPresets).find(
              ([_, value]) => value.label === label
            )?.[0] as Preset;
            return (
              <CommandItem
                className="flex items-center gap-2 py-2 data-[highlighted]:bg-secondary/50"
                key={label}
                onSelect={() => {
                  setPreset(presetName);
                  setOpen(false);
                }}
                value={label}
              >
                <ThemeColors mode={theme} presetName={presetName} />
                <div className="flex flex-1 items-center gap-2">
                  <span className="font-medium text-sm capitalize">
                    {defaultPresets[presetName]?.label || presetName}
                  </span>
                </div>
                {presetName === preset && (
                  <Check className="h-4 w-4 shrink-0 opacity-70" />
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  return (
    <div className="flex w-full items-center">
      {isMobile ? (
        <Drawer onOpenChange={setOpen} open={open}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Select Theme</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">{commandContent}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent align="center" className="w-[300px] p-0">
            {commandContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default ThemePresetSelect;
