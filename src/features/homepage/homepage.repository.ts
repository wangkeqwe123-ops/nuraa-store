import "server-only";
import { db } from "@/lib/db";

export type HomepageContentSection={id:string;sectionKey:string;title:string;subtitle:string;mediaType:"IMAGE"|"VIDEO";desktopMediaUrl:string|null;mobileMediaUrl:string|null;buttonText:string;buttonLink:string;sortOrder:number};

export async function listHomepageSections(){
  const rows=await db.homepageSection.findMany({where:{status:"ACTIVE"},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]});
  return rows.map(row=>({id:row.id,sectionKey:row.sectionKey,title:row.title,subtitle:row.subtitle||"",mediaType:row.mediaType,desktopMediaUrl:row.desktopMediaUrl,mobileMediaUrl:row.mobileMediaUrl,buttonText:row.buttonText||"",buttonLink:row.buttonLink||"",sortOrder:row.sortOrder})) satisfies HomepageContentSection[];
}
