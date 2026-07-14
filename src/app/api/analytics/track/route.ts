import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema=z.object({eventType:z.enum(["PAGE_VIEW","PRODUCT_VIEW","ADD_TO_CART","CHECKOUT_START"]),visitorId:z.string().uuid(),sessionId:z.string().uuid(),productId:z.string().optional(),productSlug:z.string().max(200).optional(),path:z.string().max(500).optional(),referrer:z.string().max(1000).nullable().optional(),utmSource:z.string().max(100).nullable().optional(),utmMedium:z.string().max(100).nullable().optional(),utmCampaign:z.string().max(200).nullable().optional(),utmContent:z.string().max(200).nullable().optional()});
const clean=(value:string|null|undefined)=>value?.trim().toLowerCase()||null;
function channel(source:string|null){if(!source||source==="direct")return"DIRECT" as const;if(source.includes("tiktok"))return"TIKTOK" as const;if(source.includes("facebook")||source.includes("meta"))return"FACEBOOK" as const;if(source.includes("google"))return"GOOGLE" as const;return"OTHER" as const}
function riyadhDate(){const value=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Riyadh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());return new Date(`${value}T00:00:00.000Z`)}

export async function POST(request:Request){
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid analytics event"},{status:400});
  const d=parsed.data;
  const product=d.productId||d.productSlug?await db.product.findFirst({where:d.productId?{id:d.productId,deletedAt:null}:{slug:d.productSlug,deletedAt:null},select:{id:true}}):null;
  if(d.eventType!=="PAGE_VIEW"&&!product)return NextResponse.json({error:"Product is required"},{status:400});
  const productId=product?.id;
  const source=clean(d.utmSource),medium=clean(d.utmMedium),campaign=clean(d.utmCampaign),content=clean(d.utmContent);
  const fingerprint=createHash("sha256").update([source,medium,campaign,content].join("|")).digest("hex");
  const traffic=await db.trafficSource.upsert({where:{fingerprint},update:{utmSource:source,utmMedium:medium,utmCampaign:campaign,utmContent:content},create:{fingerprint,channel:channel(source),utmSource:source,utmMedium:medium,utmCampaign:campaign,utmContent:content}});
  await db.$transaction(async tx=>{
    await tx.analyticsEvent.create({data:{eventType:d.eventType,visitorId:d.visitorId,sessionId:d.sessionId,productId,path:d.path,referrer:d.referrer,trafficSourceId:traffic.id}});
    if(productId){const date=riyadhDate();const key={productId_date:{productId,date}};const create={productId,date,productViews:d.eventType==="PRODUCT_VIEW"?1:0,addToCarts:d.eventType==="ADD_TO_CART"?1:0,checkoutStarts:d.eventType==="CHECKOUT_START"?1:0};const update=d.eventType==="PRODUCT_VIEW"?{productViews:{increment:1}}:d.eventType==="ADD_TO_CART"?{addToCarts:{increment:1}}:{checkoutStarts:{increment:1}};await tx.productAnalytics.upsert({where:key,create,update})}
  });
  return NextResponse.json({ok:true},{status:201});
}
