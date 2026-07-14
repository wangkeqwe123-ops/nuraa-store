"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteHomepageMedia } from "@/lib/supabase-storage";

const sectionSchema=z.object({id:z.string().min(1),title:z.string().min(1).max(180),subtitle:z.string().max(500),mediaType:z.enum(["IMAGE","VIDEO"]),desktopMediaUrl:z.string().max(2000).nullable(),mobileMediaUrl:z.string().max(2000).nullable(),buttonText:z.string().max(100),buttonLink:z.string().max(500),status:z.enum(["ACTIVE","INACTIVE"])});
export type HomepageSectionInput=z.infer<typeof sectionSchema>;

function refreshHomepage(){revalidatePath("/admin/homepage");revalidatePath("/en");revalidatePath("/ar");}

async function cleanupIfUnused(url:string|null){
  if(!url)return;
  const count=await db.homepageSection.count({where:{OR:[{desktopMediaUrl:url},{mobileMediaUrl:url}]}});
  if(count===0)await deleteHomepageMedia(url);
}

export async function saveHomepageSection(input:HomepageSectionInput){
  await requireAdmin();
  const data=sectionSchema.parse(input);
  const previous=await db.homepageSection.findUniqueOrThrow({where:{id:data.id}});
  await db.homepageSection.update({where:{id:data.id},data:{title:data.title,subtitle:data.subtitle||null,mediaType:data.mediaType,desktopMediaUrl:data.desktopMediaUrl||null,mobileMediaUrl:data.mobileMediaUrl||null,buttonText:data.buttonText||null,buttonLink:data.buttonLink||null,status:data.status}});
  if(previous.desktopMediaUrl!==data.desktopMediaUrl)await cleanupIfUnused(previous.desktopMediaUrl);
  if(previous.mobileMediaUrl!==data.mobileMediaUrl&&previous.mobileMediaUrl!==previous.desktopMediaUrl)await cleanupIfUnused(previous.mobileMediaUrl);
  refreshHomepage();
  return {ok:true};
}

export async function toggleHomepageSection(id:string){
  await requireAdmin();
  const section=await db.homepageSection.findUniqueOrThrow({where:{id}});
  await db.homepageSection.update({where:{id},data:{status:section.status==="ACTIVE"?"INACTIVE":"ACTIVE"}});
  refreshHomepage();
}

export async function moveHomepageSection(id:string,direction:"up"|"down"){
  await requireAdmin();
  const current=await db.homepageSection.findUniqueOrThrow({where:{id}});
  const adjacent=await db.homepageSection.findFirst({where:direction==="up"?{sortOrder:{lt:current.sortOrder}}:{sortOrder:{gt:current.sortOrder}},orderBy:{sortOrder:direction==="up"?"desc":"asc"}});
  if(adjacent)await db.$transaction([db.homepageSection.update({where:{id:current.id},data:{sortOrder:adjacent.sortOrder}}),db.homepageSection.update({where:{id:adjacent.id},data:{sortOrder:current.sortOrder}})]);
  refreshHomepage();
}
