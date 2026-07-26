export type AppToastDetail = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function showToast(detail: AppToastDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app-toast", { detail }));
}
