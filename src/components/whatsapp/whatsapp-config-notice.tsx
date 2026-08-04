import Link from "next/link";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsAppConfigNotice({
  locale,
  floating = false,
}: {
  locale: "en" | "ar";
  floating?: boolean;
}) {
  const copy = locale === "ar"
    ? {
        title: "لم يتم إعداد واتساب",
        action: "فتح إعدادات الإدارة",
      }
    : {
        title: "WhatsApp is not configured",
        action: "Open Admin Settings",
      };

  return (
    <aside
      role="status"
      data-whatsapp-config-notice
      className={cn(
        "border border-amber-700/25 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm",
        floating
          ? "fixed end-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 max-w-[min(22rem,calc(100vw-2rem))] sm:end-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
          : "mt-3",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[.1em]">
        {copy.title}
      </p>
      <Link
        href="/admin/settings"
        className="mt-2 inline-flex min-h-8 items-center gap-2 text-xs font-medium underline underline-offset-4"
      >
        <Settings className="size-3.5" aria-hidden="true" />
        {copy.action}
      </Link>
    </aside>
  );
}
