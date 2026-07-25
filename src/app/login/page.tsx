"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!json.success) {
        setErrorMsg(json.message || "Login gagal");
        return;
      }

      const role = json.data?.user?.role;
      router.push(role === "ADMIN" ? "/admin" : "/karyawan");
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-2 shadow-sm">
            <span className="text-primary-foreground font-bold text-2xl">S</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">SIPKA</CardTitle>
          <CardDescription>Sistem Informasi Penggajian Karyawan</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="........"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {errorMsg ? <p className="text-sm text-destructive">{errorMsg}</p> : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11 text-base shadow-sm" disabled={loading}>
              {loading ? "Memproses..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
