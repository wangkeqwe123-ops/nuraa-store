import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { homepageStorageConfigured } from "@/lib/supabase-storage";
import { HomepageCms, type CmsSection } from "./homepage-cms";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";

function usageLabel(sectionKey:string,slot:"desktop"|"mobile"){const sectionName=sectionKey==="hero_banner"?"Hero Banner":sectionKey==="brand_story"?"Brand Story":sectionKey.startsWith("collection_")?`Collection / ${sectionKey.replace("collection_","").replaceAll("_"," ")}`:sectionKey.startsWith("gift_")?`Gift / ${sectionKey.replace("gift_","").replaceAll("_"," ")}`:"Journal";return `Homepage / ${sectionName} / ${slot}`;}

export default async function HomepageAdmin(){
  const rows=await db.homepageSection.findMany({orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]});
  const references=new Map<string,string[]>();
  for(const row of rows){if(row.desktopMediaUrl)references.set(row.desktopMediaUrl,[...(references.get(row.desktopMediaUrl)||[]),usageLabel(row.sectionKey,"desktop")]);if(row.mobileMediaUrl)references.set(row.mobileMediaUrl,[...(references.get(row.mobileMediaUrl)||[]),usageLabel(row.sectionKey,"mobile")]);}
  const sections:CmsSection[]=rows.map(row=>({id:row.id,sectionKey:row.sectionKey,title:row.title,subtitle:row.subtitle||"",mediaType:row.mediaType,desktopMediaUrl:row.desktopMediaUrl,mobileMediaUrl:row.mobileMediaUrl,buttonText:row.buttonText||"",buttonLink:row.buttonLink||"",status:row.status,sortOrder:row.sortOrder,references:{desktop:row.desktopMediaUrl?references.get(row.desktopMediaUrl)||[]:[],mobile:row.mobileMediaUrl?references.get(row.mobileMediaUrl)||[]:[]}}));
  const configured=homepageStorageConfigured();
  return <><PageHeader eyebrow="Storefront" title="Homepage CMS" description="Manage homepage content, media, visibility and display order." actions={<Button nativeButton={false} variant="outline" render={<Link href="/en" target="_blank"/>}>Preview homepage<ExternalLink/></Button>}/>{!configured&&<div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="font-medium text-amber-900">Supabase Storage configuration required</p><p className="mt-1 text-sm text-amber-800">Add SUPABASE_URL and SUPABASE_SECRET_KEY to .env. Existing media remains visible; uploads are disabled until configured.</p></div>}<HomepageCms sections={sections} storageConfigured={configured}/></>;
}
