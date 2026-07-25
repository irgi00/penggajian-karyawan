import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function KaryawanDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Karyawan"
        description="Selamat datang kembali di Employee Self Service (ESS)."
      />
      
      <Card className="shadow-sm border-none">
        <CardContent className="p-12">
          <EmptyState 
            title="Tidak ada data ringkasan" 
            description="Data statistik Anda belum dapat ditampilkan." 
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-none">
          <CardHeader>
            <CardTitle>Pengumuman Perusahaan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tidak ada pengumuman baru saat ini.</p>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm border-none">
          <CardHeader>
            <CardTitle>Jadwal Kerja Mendatang</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Jadwal Anda minggu ini adalah Senin-Jumat, 09:00 - 17:00.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
