import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteHomepageMedia, uploadHomepageMedia } from "@/lib/supabase-storage";

const ALLOWED=new Set(["image/jpeg","image/png","image/webp","image/avif","image/gif","video/mp4","video/webm","video/quicktime"]);
const MAX_SIZE=50*1024*1024;

export async function POST(request:Request){
  if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const data=await request.formData();
    const file=data.get("file");
    const sectionKey=String(data.get("sectionKey")||"homepage").replace(/[^a-z0-9_-]/gi,"-").toLowerCase();
    if(!(file instanceof File)||file.size===0)return NextResponse.json({error:"Choose an image or video."},{status:400});
    if(!ALLOWED.has(file.type))return NextResponse.json({error:"Unsupported media type."},{status:400});
    if(file.size>MAX_SIZE)return NextResponse.json({error:"Media must be 50MB or smaller."},{status:400});
    const extension=file.name.split(".").pop()?.replace(/[^a-z0-9]/gi,"").toLowerCase()||"bin";
    const url=await uploadHomepageMedia(file,`${sectionKey}/${Date.now()}-${randomUUID()}.${extension}`);
    return NextResponse.json({url,mediaType:file.type.startsWith("video/")?"VIDEO":"IMAGE"});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Upload failed."},{status:500});}
}

export async function DELETE(request:Request){
  if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const {sectionId,slot}=await request.json() as {sectionId:string;slot:"desktop"|"mobile"};
    if(!sectionId||!["desktop","mobile"].includes(slot))return NextResponse.json({error:"Invalid request."},{status:400});
    const section=await db.homepageSection.findUnique({where:{id:sectionId}});
    if(!section)return NextResponse.json({error:"Section not found."},{status:404});
    const url=slot==="desktop"?section.desktopMediaUrl:section.mobileMediaUrl;
    if(!url)return NextResponse.json({ok:true,references:[]});
    await db.homepageSection.update({where:{id:sectionId},data:slot==="desktop"?{desktopMediaUrl:null}:{mobileMediaUrl:null}});
    const references=await db.homepageSection.findMany({where:{OR:[{desktopMediaUrl:url},{mobileMediaUrl:url}]},select:{sectionKey:true,desktopMediaUrl:true,mobileMediaUrl:true}});
    if(references.length===0)await deleteHomepageMedia(url);
    return NextResponse.json({ok:true,references:references.map(item=>item.sectionKey)});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Delete failed."},{status:500});}
}
