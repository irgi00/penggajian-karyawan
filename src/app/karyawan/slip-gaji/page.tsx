import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function SlipGajiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Slip Gaji"
        description="Unduh dan lihat slip gaji Anda setiap bulannya."
      />

      <Card className="shadow-sm border-none">
        <CardContent className="p-12">
          <EmptyState 
            title="Belum ada slip gaji yang diterbitkan" 
            description="Slip gaji bulan ini akan muncul di sini setelah payroll selesai diproses." 
          />
        </CardContent>
      </Card>
    </div>
  )
}
