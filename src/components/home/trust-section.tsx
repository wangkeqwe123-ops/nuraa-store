import { MessageCircle, Sparkles, Truck } from "lucide-react";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";
import type { Locale } from "@/i18n/config";

export function TrustSection({
  locale,
  whatsappNumber,
  whatsappMessageTemplate,
}: {
  locale: Locale;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}) {
  const isArabic = locale === "ar";
  const heading = isArabic ? "تواصل مع نورا" : "Contact NURAA";
  const items = isArabic
    ? [
        ["دعم عبر واتساب", "تحدث مباشرة مع فريق نورا لاختيار العطر المناسب لمنزلك."],
        ["توصيل داخل السعودية", "توصيل موثوق بعناية إلى جميع أنحاء المملكة."],
        ["عطور عربية فاخرة", "تركيبات راقية مستوحاة من ثقافة العود والضيافة العربية."],
      ]
    : [
        ["WhatsApp Support", "Speak directly with NURAA for personal fragrance guidance."],
        ["Saudi Delivery", "Careful, tracked delivery throughout the Kingdom."],
        ["Premium Arabian Fragrance", "Refined compositions rooted in oud culture and Arabian hospitality."],
      ];
  const icons = [MessageCircle, Truck, Sparkles];
  const message = isArabic
    ? "مرحباً نورا، أود المساعدة في اختيار عطر لمنزلي."
    : whatsappMessageTemplate;

  return (
    <section className="border-y border-[#1f342b]/12 bg-[#eee8dc] px-5 py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <h2 className="font-display text-center text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-none tracking-[-.025em] text-[#1f342b]">
          {heading}
        </h2>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {items.map(([title, body], index) => {
            const Icon = icons[index];
            const content = (
              <>
                <Icon
                  className="mx-auto text-[#7b4d35]"
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
                <h3 className="font-display mt-5 text-3xl font-medium text-[#1f342b]">
                  {title}
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-[#1f342b]/68">
                  {body}
                </p>
              </>
            );

            return index === 0 && whatsappNumber ? (
              <WhatsAppLink
                key={title}
                phone={whatsappNumber}
                message={message}
                source="home_trust"
                className="group block min-h-44 text-center md:border-e md:border-[#1f342b]/16"
                ariaLabel={title}
              >
                {content}
                <span className="mt-5 inline-block border-b border-[#1f342b] pb-1 text-sm font-medium">
                  {isArabic ? "ابدأ المحادثة" : "Start a conversation"}
                </span>
              </WhatsAppLink>
            ) : (
              <div
                key={title}
                className="min-h-44 text-center md:border-e md:border-[#1f342b]/16 md:last:border-0"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
