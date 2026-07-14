import { notFound } from "next/navigation"; import { isLocale } from "@/i18n/config"; import { SiteHeader } from "@/components/site-header"; import { SiteFooter } from "@/components/site-footer";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
export function generateStaticParams(){ return [{locale:"en"},{locale:"ar"}]; }
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) { const {locale}=await params; if(!isLocale(locale)) notFound(); return <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}><AnalyticsTracker/><SiteHeader locale={locale}/><main>{children}</main><SiteFooter locale={locale}/></div> }
