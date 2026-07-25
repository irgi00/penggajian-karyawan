import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description="Informasi data diri dan detail pekerjaan Anda."
      />

      <Card className="shadow-sm border-none">
        <CardContent className="p-12">
          <EmptyState 
            title="Profil Dikelola oleh HR" 
            description="Silakan hubungi tim HR atau Administrator untuk melihat dan memperbarui data profil Anda." 
          />
        </CardContent>
      </Card>
    </div>
  )
}
