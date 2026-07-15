import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { products } from "../src/lib/products";

const url=process.env.DIRECT_URL??process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL is required");
const db=new PrismaClient({adapter:new PrismaPg({connectionString:url})});

const fragrance = [
  { family:"Amber Woody", top:["Saffron","Bergamot"], heart:["Rose","Amber"], base:["Oud","Soft Musk"], occasions:["Evening gatherings","A quiet personal ritual"], story:"Sahar captures the golden stillness just before dawn, when warm amber meets precious oud.", gift:"A concentrated fragrance presented in our deep green gift box with warm gold detailing." },
  { family:"Floral Amber", top:["Pink Pepper","Pear"], heart:["Taif Rose","Jasmine"], base:["Amber","Cashmere Wood"], occasions:["Welcoming guests","Brightening living spaces"], story:"A luminous rose composition inspired by desert gardens after the first rain.", gift:"Wrapped in the NURAA signature presentation, ready for thoughtful celebrations." },
  { family:"Woody Oud", top:["Bergamot","Cardamom"], heart:["Sheer Rose","Cedarwood"], base:["Oud","Amber","Musk"], occasions:["The evening majlis","Slow weekend rituals"], story:"Quiet Oud is our ode to Arabian hospitality: grounded woods, soft rose and a trail of amber.", gift:"The diffuser and reeds arrive in a structured forest-green box with a gold foil seal." },
] as const;

async function main(){
  const email=(process.env.ADMIN_EMAIL??"admin@nuraa.sa").toLowerCase();
  const password=process.env.ADMIN_PASSWORD??"change-this-before-production";
  await db.adminUser.upsert({where:{email},update:{isActive:true},create:{email,name:"Nuraa Admin",passwordHash:await hash(password,12)}});
  for(const [index,item] of products.entries()){
    const categorySlug=item.en.category.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    const category=await db.category.upsert({where:{slug:categorySlug},update:{},create:{slug:categorySlug,translations:{create:[{locale:"EN",name:item.en.category},{locale:"AR",name:item.ar.category}]}}});
    const scent=fragrance[index];
    const product=await db.product.upsert({where:{slug:item.slug},update:{price:item.price,rating:0,reviewCount:0,compareAtPrice:null,isFeatured:false,categoryId:category.id,fragranceFamily:scent.family},create:{slug:item.slug,sku:`NUR-00${index+1}`,price:item.price,compareAtPrice:null,currency:"SAR",stock:30,status:"ACTIVE",isFeatured:false,sortOrder:index,categoryId:category.id,rating:0,reviewCount:0,fragranceFamily:scent.family,translations:{create:[{locale:"EN",name:item.en.name,shortDescription:item.en.description,description:item.en.description,benefits:item.en.benefits,usage:item.en.usage,scentFamily:scent.family,fragranceNotes:[scent.family,...scent.heart],topNotes:[...scent.top],heartNotes:[...scent.heart],baseNotes:[...scent.base],usageOccasions:[...scent.occasions],story:scent.story,giftDescription:scent.gift,metaTitle:`${item.en.name} | NURAA`,metaDescription:item.en.description},{locale:"AR",name:item.ar.name,shortDescription:item.ar.description,description:item.ar.description,benefits:item.ar.benefits,usage:item.ar.usage,scentFamily:scent.family,fragranceNotes:[scent.family,...scent.heart],topNotes:[...scent.top],heartNotes:[...scent.heart],baseNotes:[...scent.base],usageOccasions:[...scent.occasions],story:scent.story,giftDescription:scent.gift,metaTitle:`${item.ar.name} | NURAA`,metaDescription:item.ar.description}]},media:{create:{type:"MAIN_IMAGE",url:item.image,sortOrder:0,isPrimary:true}}}});
    const main=await db.productMedia.findFirst({where:{productId:product.id,type:"MAIN_IMAGE"},orderBy:{sortOrder:"asc"}});
    if(main)await db.productMedia.update({where:{id:main.id},data:{url:item.image,isPrimary:true,sortOrder:0}});
    await db.productTranslation.updateMany({where:{productId:product.id},data:{fragranceNotes:[scent.family,...scent.heart],scentFamily:scent.family,topNotes:[...scent.top],heartNotes:[...scent.heart],baseNotes:[...scent.base],usageOccasions:[...scent.occasions],story:scent.story,giftDescription:scent.gift}});
    await db.productTranslation.update({where:{productId_locale:{productId:product.id,locale:"EN"}},data:{name:item.en.name,shortDescription:item.en.description,description:item.en.description,benefits:item.en.benefits,usage:item.en.usage,metaTitle:`${item.en.name} | NURAA`,metaDescription:item.en.description}});
    await db.productTranslation.update({where:{productId_locale:{productId:product.id,locale:"AR"}},data:{name:item.ar.name,shortDescription:item.ar.description,description:item.ar.description,benefits:item.ar.benefits,usage:item.ar.usage,metaTitle:`${item.ar.name} | NURAA`,metaDescription:item.ar.description}});
  }
  const homepageSections=[
    {sectionKey:"hero_banner",title:"Luxury Arabian Home Fragrance",subtitle:"Fragrances made for generous homes, shared tables and the moments that stay with us.",desktopMediaUrl:"/images/brand-v2/hero-family.png",mobileMediaUrl:"/images/brand-v2/hero-family.png",buttonText:"Discover the collections",buttonLink:"#collections",sortOrder:10},
    {sectionKey:"brand_story",title:"The Essence of Arabian Homes",subtitle:"A story of Arabian hospitality, oud tradition and family moments.",desktopMediaUrl:"/images/brand-v2/essence-arabian-homes.png",mobileMediaUrl:"/images/brand-v2/essence-arabian-homes.png",buttonText:"Our story",buttonLink:"#story",sortOrder:20},
    {sectionKey:"collection_desert_oud",title:"Desert Oud",subtitle:"Oud · Cedarwood · Smoked Amber",desktopMediaUrl:"/images/brand-v2/collection-desert-oud.png",mobileMediaUrl:"/images/brand-v2/collection-desert-oud.png",buttonText:"Discover",buttonLink:"/en/products",sortOrder:30},
    {sectionKey:"collection_rose_garden",title:"Rose Garden",subtitle:"Taif Rose · Jasmine · Soft Musk",desktopMediaUrl:"/images/brand-v2/collection-rose-garden.png",mobileMediaUrl:"/images/brand-v2/collection-rose-garden.png",buttonText:"Discover",buttonLink:"/en/products",sortOrder:31},
    {sectionKey:"collection_amber_night",title:"Amber Night",subtitle:"Amber · Cardamom · Cashmere Wood",desktopMediaUrl:"/images/brand-v2/ritual-evening.png",mobileMediaUrl:"/images/brand-v2/ritual-evening.png",buttonText:"Discover",buttonLink:"/en/products",sortOrder:32},
    {sectionKey:"gift_ramadan",title:"Ramadan",subtitle:"For evenings of reflection and gathering.",desktopMediaUrl:"/images/brand-v2/ritual-evening.png",mobileMediaUrl:"/images/brand-v2/ritual-evening.png",buttonText:"Explore gifts",buttonLink:"/en/products",sortOrder:40},
    {sectionKey:"gift_eid",title:"Eid",subtitle:"A generous expression of joy.",desktopMediaUrl:"/images/brand-v2/hero-family.png",mobileMediaUrl:"/images/brand-v2/hero-family.png",buttonText:"Explore gifts",buttonLink:"/en/products",sortOrder:41},
    {sectionKey:"gift_wedding",title:"Wedding",subtitle:"A lasting scent for a new chapter.",desktopMediaUrl:"/images/brand-v2/essence-arabian-homes.png",mobileMediaUrl:"/images/brand-v2/essence-arabian-homes.png",buttonText:"Explore gifts",buttonLink:"/en/products",sortOrder:42},
    {sectionKey:"gift_new_home",title:"New Home",subtitle:"The first fragrance of a new place.",desktopMediaUrl:"/images/brand-v2/collection-rose-garden.png",mobileMediaUrl:"/images/brand-v2/collection-rose-garden.png",buttonText:"Explore gifts",buttonLink:"/en/products",sortOrder:43},
    {sectionKey:"journal_section",title:"The Journal",subtitle:"Stories of scent, place and the art of Arabian living.",desktopMediaUrl:"/images/brand-v2/ritual-afternoon.png",mobileMediaUrl:"/images/brand-v2/ritual-afternoon.png",buttonText:"Read the story",buttonLink:"#journal",sortOrder:50},
  ];
  for(const section of homepageSections){await db.homepageSection.upsert({where:{sectionKey:section.sectionKey},update:{},create:{...section,mediaType:"IMAGE",status:"ACTIVE"}});}
}
main().finally(()=>db.$disconnect());
