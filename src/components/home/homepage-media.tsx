import Image from "next/image";
import type { HomepageContentSection } from "@/features/homepage/homepage.repository";
import { cn } from "@/lib/utils";

export function HomepageMedia({section,alt,className,priority=false,sizes="100vw",quality=85}:{section:HomepageContentSection;alt:string;className?:string;priority?:boolean;sizes?:string;quality?:number}){
  const desktop=section.desktopMediaUrl||section.mobileMediaUrl;
  const mobile=section.mobileMediaUrl||desktop;
  if(!desktop)return <div className={cn("size-full bg-[#eeeae3]",className)}/>;
  if(section.mediaType==="VIDEO")return <><video src={mobile||desktop} autoPlay muted loop playsInline className={cn("size-full object-cover md:hidden",className)}/><video src={desktop} autoPlay muted loop playsInline className={cn("hidden size-full object-cover md:block",className)}/></>;
  return <><Image src={mobile||desktop} alt={alt} fill priority={priority} quality={quality} className={cn("object-cover md:hidden",className)} sizes={sizes}/><Image src={desktop} alt={alt} fill priority={priority} quality={quality} className={cn("hidden object-cover md:block",className)} sizes={sizes}/></>;
}
