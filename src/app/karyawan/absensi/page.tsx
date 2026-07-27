import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function AbsensiKaryawanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi Saya"
        description="Lihat riwayat kehadiran Anda di sini."
      />

      <Card className="shadow-sm border-none">
        <CardContent className="p-12">
          <EmptyState 
            title="Belum ada data absensi" 
            description="Riwayat kehadiran Anda belum tersedia atau belum diunggah oleh admin." 
          />
        </CardContent>
      </Card>
    </div>
  )
}
