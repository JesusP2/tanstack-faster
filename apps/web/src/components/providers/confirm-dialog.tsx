import type { VariantProps } from 'class-variance-authority';
import { createContext, type ReactNode, useContext, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button, type buttonVariants } from '../ui/button';

type ConfirmFnProps = {
  title: ReactNode;
  description: ReactNode;
  handleConfirm: () => void;
  handleCancel?: () => void;
  variant?: VariantProps<typeof buttonVariants>['variant'];
};

type ConfirmDialogProviderState = {
  openConfirmDialog: (config: ConfirmFnProps) => void;
};

const ConfirmDialogContext = createContext<ConfirmDialogProviderState>({
  openConfirmDialog: (_config: ConfirmFnProps) => null,
});

export const useConfirmDialog = () => useContext(ConfirmDialogContext);
export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<ConfirmFnProps & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    description: '',
    handleConfirm: () => null,
    handleCancel: () => null,
    variant: 'destructive',
  });

  function openConfirmDialog({
    title,
    description,
    handleConfirm,
    handleCancel,
    variant,
  }: ConfirmFnProps) {
    setConfig({
      isOpen: true,
      title,
      description,
      handleConfirm,
      handleCancel,
      variant: variant || 'destructive',
    });
  }

  return (
    <>
      <ConfirmDialogContext.Provider value={{ openConfirmDialog }}>
        {children}
        <Dialog
          onOpenChange={(open) =>
            !open && setConfig({ ...config, isOpen: false })
          }
          open={config.isOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => {
                  config.handleCancel?.();
                  setConfig({ ...config, isOpen: false });
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  config.handleConfirm();
                  setConfig({ ...config, isOpen: false });
                }}
                variant={config.variant}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ConfirmDialogContext.Provider>
    </>
  );
}
