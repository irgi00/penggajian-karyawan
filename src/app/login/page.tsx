import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="Masukkan username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="remember" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
            <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Remember me
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <form action={loginAction.bind(null, "admin")} className="w-full">
            <Button type="submit" className="w-full h-11 text-base shadow-sm">
              Login sebagai Admin
            </Button>
          </form>
          <form action={loginAction.bind(null, "karyawan")} className="w-full">
            <Button type="submit" variant="outline" className="w-full h-11 text-base shadow-sm">
              Login sebagai Karyawan
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
