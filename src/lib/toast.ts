export type AppToastDetail = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Mengirim event toast ke sisi client untuk menampilkan notifikasi UI.
export function showToast(detail: AppToastDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app-toast", { detail }));
}
