"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader({
  locale,
  announcement,
}: {
  locale: Locale;
  announcement?: { text: string; href: string } | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const other = locale === "en" ? "ar" : "en";
  const home = `/${locale}`;
  const items = locale === "ar"
    ? [["الرئيسية", home], ["العطور", `${home}/products#catalog`], ["المجموعات", `${home}#collections`], ["الهدايا", `${home}#gifts`], ["قصتنا", `${home}#story`]]
    : [["Home", home], ["Fragrance", `${home}/products#catalog`], ["Collections", `${home}#collections`], ["Gifts", `${home}#gifts`], ["Our Story", `${home}#story`]];

  const active = (href: string) => href === home
    ? pathname === home
    : href.includes("products") && pathname.startsWith(`${home}/products`);
  const announcementText = announcement === undefined
    ? locale === "ar"
      ? "توصيل مجاني داخل المملكة للطلبات فوق 250 ر.س"
      : "Complimentary delivery across KSA on orders over 250 SAR"
    : announcement?.text;

  useEffect(() => {
    const load = () => {
      void fetch("/api/cart")
        .then((response) => response.ok ? response.json() : null)
        .then((data) => setBagCount(data?.itemCount ?? 0))
        .catch(() => undefined);
    };
    load();
    window.addEventListener("nuraa:cart-updated", load);
    return () => window.removeEventListener("nuraa:cart-updated", load);
  }, []);

  return (
    <>
      <a href="#main-content" className="sr-only z-[100] bg-white px-4 py-3 text-black focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        {locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}
      </a>
      {announcementText ? (
        <div className="bg-[#17251f] px-4 py-2 text-center text-[11px] font-medium tracking-[.08em] text-[#f4f1e8]">
          {announcement?.href
            ? <Link href={announcement.href}>{announcementText}</Link>
            : announcementText}
        </div>
      ) : null}
      <header className="sticky top-0 z-40 border-b border-[#17251f]/12 bg-[#fbfaf7]/96 text-[#17251f] backdrop-blur-md">
        <div className="relative mx-auto flex h-[72px] max-w-[1560px] items-center px-4 sm:px-6 lg:h-[84px] lg:px-10">
          <div className="flex flex-1 items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger render={<button aria-label={locale === "ar" ? "فتح القائمة" : "Open menu"} className="grid size-11 place-items-center lg:hidden" />}>
                <Menu />
              </SheetTrigger>
              <SheetContent side={locale === "ar" ? "right" : "left"} className="bg-[#fbfaf7] text-[#17251f]">
                <SheetHeader className="border-b border-[#17251f]/12 px-7 py-7">
                  <SheetTitle className="font-display text-4xl font-semibold tracking-[.16em]" translate="no">NURAA</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col px-7 py-4" aria-label={locale === "ar" ? "التنقل الرئيسي" : "Primary navigation"}>
                  {items.map(([label, href]) => (
                    <Link key={href} href={href} onClick={() => setOpen(false)} className="border-b border-[#17251f]/12 py-5 font-display text-3xl">
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex xl:gap-9">
              {items.slice(0, 3).map(([label, href]) => (
                <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={cn("relative py-3 text-[13px] font-medium transition-opacity hover:opacity-55 after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-start after:scale-x-0 after:bg-current after:transition-transform", active(href) && "after:scale-x-100")}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href={home} aria-label="NURAA home" translate="no" className="font-display absolute left-1/2 -translate-x-1/2 text-[30px] font-semibold tracking-[.22em] lg:text-[36px]">
            NURAA
          </Link>

          <div className="ms-auto flex flex-1 items-center justify-end gap-1 lg:gap-3">
            <nav className="me-4 hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Secondary navigation">
              {items.slice(3).map(([label, href]) => (
                <Link key={href} href={href} className="text-[13px] font-medium transition-opacity hover:opacity-55">{label}</Link>
              ))}
            </nav>
            <Link href={`/${other}`} aria-label={other === "ar" ? "العربية" : "English"} className="grid size-11 place-items-center text-xs font-semibold">
              {other === "ar" ? "ع" : "EN"}
            </Link>
            <Link href={`${home}/cart`} aria-label={locale === "ar" ? "حقيبة التسوق" : "Shopping bag"} className="relative grid size-11 place-items-center border border-transparent transition-colors hover:border-[#17251f]/20">
              <ShoppingBag />
              {bagCount > 0 ? <span className="absolute end-0 top-0 grid min-w-5 place-items-center bg-[#17251f] px-1 text-[10px] leading-5 text-white">{bagCount}</span> : null}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
