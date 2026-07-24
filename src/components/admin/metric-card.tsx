import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({ label, value, helper, icon: Icon, accent = false }: { label: string; value: string; helper: string; icon: LucideIcon; accent?: boolean }) {
  return (
    <Card size="sm" className="border-[#17251f]/10 bg-card shadow-none">
      <CardContent className="flex min-h-36 flex-col justify-between p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className={accent ? "text-[#956c20]" : "text-[#17251f]/55"} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <div>
          <p className={accent ? "text-[28px] font-semibold tracking-[-.035em] text-[#8a621a]" : "text-[28px] font-semibold tracking-[-.035em] text-[#17251f]"}>{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}
