"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { WhatsAppLink } from "./whatsapp-link";

export function WhatsAppFloatingButton({
  locale,
  phone,
  message,
}: {
  locale: Locale;
  phone: string;
  message: string;
}) {
  const label = locale === "ar" ? "تواصل مع نورا" : "Chat with NURAA";
  const pathname = usePathname();
  const [suppressed, setSuppressed] = useState(false);

  useEffect(() => {
    const resetFrame = requestAnimationFrame(() => setSuppressed(false));
    const targets = document.querySelectorAll<HTMLElement>(
      '[data-whatsapp-source]:not([data-whatsapp-source="floating"])',
    );
    const observer = new IntersectionObserver(
      (entries) => {
        setSuppressed(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: 0.2 },
    );
    targets.forEach((target) => observer.observe(target));

    return () => {
      cancelAnimationFrame(resetFrame);
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <WhatsAppLink
      phone={phone}
      message={message}
      source="floating"
      ariaLabel={label}
      className={`fixed end-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 inline-flex size-13 items-center justify-center gap-2.5 bg-[#17251f] text-sm font-medium text-white shadow-[0_6px_12px_rgba(23,37,31,.18)] transition-[transform,background-color,opacity] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#24372f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a47728] motion-reduce:transition-none sm:end-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:h-13 sm:w-auto sm:px-5 ${
        suppressed ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"
      }`}
    >
      <MessageCircle className="size-5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </WhatsAppLink>
  );
}
