import * as React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

/**
 * Generic confirmation dialog.
 * Props:
 * - open: controlled open state
 * - onOpenChange: toggle handler
 * - title: dialog title
 * - description: dialog description
 * - onConfirm: callback when user confirms
 */
export const ConfirmDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Ya, hapus',
  cancelText = 'Batal',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild />
      <DialogContent>
        <div className="flex flex-col space-y-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </div>
        <div className="flex space-x-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {cancelText}
            </Button>
          </DialogClose>          <Button
            variant="destructive"
            onClick={() => { onConfirm(); onOpenChange(false); }}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
