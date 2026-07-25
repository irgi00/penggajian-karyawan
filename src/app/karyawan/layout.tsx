import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import KaryawanShell from "@/components/layout/karyawan-shell";

export default async function KaryawanLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("user_role")?.value;

  if (role !== "karyawan") {
    if (role === "admin") {
      redirect("/admin");
    } else {
      redirect("/login");
    }
  }

  return <KaryawanShell>{children}</KaryawanShell>;
}

