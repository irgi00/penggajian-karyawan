"use client";

import { useEffect, useState } from "react";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import type { AppToastDetail } from "@/lib/toast";

type ToastItem = AppToastDetail & { id: number; open: boolean };

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<AppToastDetail>;
      const toast = { id: Date.now() + Math.random(), open: true, ...customEvent.detail };
      setToasts((current) => [...current, toast]);
    };

    window.addEventListener("app-toast", listener);
    return () => window.removeEventListener("app-toast", listener);
  }, []);

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open={toast.open}
          variant={toast.variant}
          onOpenChange={(open) => {
            if (!open) {
              setToasts((current) => current.filter((item) => item.id !== toast.id));
            }
          }}
        >
          <div className="grid gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
