import { redirect } from "next/navigation";
import KaryawanShell from "@/components/layout/karyawan-shell";
import { getSession } from "@/lib/auth";

export default async function KaryawanLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (session?.role !== "EMPLOYEE") {
    if (session?.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/login");
    }
  }

  return <KaryawanShell>{children}</KaryawanShell>;
}
