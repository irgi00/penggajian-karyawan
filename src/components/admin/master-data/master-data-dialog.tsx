"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MasterDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  entityLabel: string;
  description: string;
  isSubmitting?: boolean;
  contentClassName?: string;
  children: ReactNode;
}

export function MasterDataDialog({
  open,
  onOpenChange,
  mode,
  entityLabel,
  description,
  isSubmitting = false,
  contentClassName,
  children,
}: MasterDataDialogProps) {
  const title = `${mode === "create" ? "Tambah" : "Edit"} ${entityLabel}`;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isSubmitting) onOpenChange(nextOpen); }}>
      <DialogContent
        className={contentClassName}
        onInteractOutside={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
