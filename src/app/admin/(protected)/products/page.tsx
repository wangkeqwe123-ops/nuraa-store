import Image from "next/image";
import Link from "next/link";
import { Boxes, Eye, PackagePlus, Plus, Search, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { MetricCard } from "@/components/admin/metric-card";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminProducts({searchParams}:{searchParams:Promise<{q?:string;status?:string}>}){
  const {q,status}=await searchParams;
  const where={deletedAt:null,...(status&&["ACTIVE","DRAFT","ARCHIVED"].includes(status)?{status:status as "ACTIVE"|"DRAFT"|"ARCHIVED"}:{}),...(q?{OR:[{sku:{contains:q,mode:"insensitive" as const}},{translations:{some:{name:{contains:q,mode:"insensitive" as const}}}}]}:{})};
  const [products,activeCount,lowStock,revenueAgg]=await Promise.all([
    db.product.findMany({where,include:{translations:true,media:{orderBy:{sortOrder:"asc"}},analyticsEvents:{select:{eventType:true,revenue:true}}},orderBy:{createdAt:"desc"}}),
    db.product.count({where:{deletedAt:null,status:"ACTIVE"}}),db.product.count({where:{deletedAt:null,stock:{lte:5}}}),db.analyticsEvent.aggregate({where:{eventType:"PURCHASE"},_sum:{revenue:true}})
  ]);
  return <>
    <PageHeader eyebrow="Catalog" title="Products" description={`${products.length} products in the current view.`} actions={<Button nativeButton={false} render={<Link href="/admin/products/new"/>}><Plus data-icon="inline-start"/>Add product</Button>}/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total products" value={String(products.length)} helper="Current filtered catalog" icon={Boxes}/><MetricCard label="Active" value={String(activeCount)} helper="Visible on storefront" icon={Eye}/><MetricCard label="Low stock" value={String(lowStock)} helper="Five units or fewer" icon={PackagePlus}/><MetricCard label="Product revenue" value={`${Number(revenueAgg._sum.revenue??0).toLocaleString()} SAR`} helper="Confirmed purchases" icon={TrendingUp} accent/></div>
    <Card className="mt-5 border-foreground/10 shadow-none"><CardContent className="p-0"><form className="flex flex-col gap-3 border-b p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input name="q" defaultValue={q} placeholder="Search name or SKU…" className="pl-9"/></div><select name="status" defaultValue={status??""} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"><option value="">All status</option><option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option></select><Button variant="outline" type="submit">Filter</Button></form>
    <div className="overflow-x-auto"><Table className="min-w-[980px]"><TableHeader><TableRow><TableHead className="pl-5">Product</TableHead><TableHead>Status</TableHead><TableHead>Stock</TableHead><TableHead>Views</TableHead><TableHead>Sales</TableHead><TableHead>Revenue</TableHead><TableHead>Updated</TableHead><TableHead className="w-12"/></TableRow></TableHeader><TableBody>
    {products.map(p=>{const en=p.translations.find(t=>t.locale==="EN"),ar=p.translations.find(t=>t.locale==="AR"),image=p.media.find(m=>m.isPrimary)?.url??p.media[0]?.url;const views=p.analyticsEvents.filter(e=>e.eventType==="PRODUCT_VIEW").length,sales=p.analyticsEvents.filter(e=>e.eventType==="PURCHASE").length,revenue=p.analyticsEvents.reduce((sum,e)=>sum+Number(e.revenue??0),0);return <TableRow key={p.id}>
      <TableCell className="pl-5"><div className="flex items-center gap-3">{image?<div className="relative size-12 overflow-hidden rounded-md bg-muted"><Image src={image} alt="" fill sizes="48px" className="object-cover"/></div>:<div className="size-12 rounded-md bg-muted"/>}<div><Link href={`/admin/products/${p.id}/edit`} className="font-medium underline-offset-4 hover:underline">{en?.name}</Link><p className="mt-0.5 text-xs text-muted-foreground">{p.sku} · {ar?.name}</p></div></div></TableCell>
      <TableCell><Badge variant="outline" className={p.status==="ACTIVE"?"border-emerald-200 bg-emerald-50 text-emerald-700":p.status==="DRAFT"?"border-amber-200 bg-amber-50 text-amber-700":"bg-muted text-muted-foreground"}>{p.status==="ACTIVE"?"Active":p.status==="DRAFT"?"Draft":"Archived"}</Badge></TableCell><TableCell><span className={p.stock<=5?"font-medium text-amber-700":""}>{p.stock}</span></TableCell><TableCell>{views}</TableCell><TableCell>{sales}</TableCell><TableCell className="font-medium text-[var(--brand-gold)]">{revenue.toLocaleString()} SAR</TableCell><TableCell className="text-xs text-muted-foreground">{p.updatedAt.toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"})}</TableCell><TableCell><ProductRowActions id={p.id} status={p.status}/></TableCell>
    </TableRow>})}
    {!products.length&&<TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No products match these filters.</TableCell></TableRow>}
    </TableBody></Table></div></CardContent></Card>
  </>
}
