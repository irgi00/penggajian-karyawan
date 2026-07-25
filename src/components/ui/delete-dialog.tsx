import * as React from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

/**
 * DeleteDialog is a thin wrapper around ConfirmDialog specifically for delete actions.
 * It receives an `onConfirm` callback that should perform the actual deletion (e.g., API call).
 */
export const DeleteDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}> = ({ open, onOpenChange, onConfirm, title = 'Hapus', description = 'Apakah Anda yakin ingin menghapus item ini?' }) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onConfirm={onConfirm}
      confirmText="Ya, hapus"
      cancelText="Batal"
    />
  );
};

export default DeleteDialog;
