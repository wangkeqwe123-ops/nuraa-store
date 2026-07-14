import Image from "next/image";
import type { HomepageContentSection } from "@/features/homepage/homepage.repository";
import { cn } from "@/lib/utils";

export function HomepageMedia({section,alt,className,priority=false}:{section:HomepageContentSection;alt:string;className?:string;priority?:boolean}){
  const desktop=section.desktopMediaUrl||section.mobileMediaUrl;
  const mobile=section.mobileMediaUrl||desktop;
  if(!desktop)return <div className={cn("size-full bg-[#eeeae3]",className)}/>;
  if(section.mediaType==="VIDEO")return <><video src={mobile||desktop} autoPlay muted loop playsInline className={cn("size-full object-cover md:hidden",className)}/><video src={desktop} autoPlay muted loop playsInline className={cn("hidden size-full object-cover md:block",className)}/></>;
  return <><Image src={mobile||desktop} alt={alt} fill priority={priority} className={cn("object-cover md:hidden",className)} sizes="100vw"/><Image src={desktop} alt={alt} fill priority={priority} className={cn("hidden object-cover md:block",className)} sizes="100vw"/></>;
}
