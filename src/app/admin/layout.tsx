import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/admin-shell";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (session?.role !== "ADMIN") {
    if (session?.role === "EMPLOYEE") {
      redirect("/karyawan");
    } else {
      redirect("/login");
    }
  }

  return <AdminShell>{children}</AdminShell>;
}
