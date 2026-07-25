import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("user_role")?.value;

  if (role !== "admin") {
    if (role === "karyawan") {
      redirect("/karyawan");
    } else {
      redirect("/login");
    }
  }

  return <AdminShell>{children}</AdminShell>;
}
