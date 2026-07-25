"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(role: "admin" | "karyawan") {
  // Simpan role di cookie
  const cookieStore = await cookies();
  cookieStore.set("user_role", role, { path: "/" });

  if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/karyawan");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("user_role");
  redirect("/login");
}
