"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, ArrowUpDown, Film, ImagePlus, Save, Trash2 } from "lucide-react";
import type { ProductMediaType, ProductStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProduct } from "./actions";

type Initial = {
  id: string;
  price: string;
  compareAtPrice: string;
  stock: number;
  status: ProductStatus;
  category: string;
  fragranceFamily: string;
  nameEn: string;
  nameAr: string;
  media: Array<{ id: string; url: string; type: ProductMediaType; sortOrder: number; isPrimary: boolean }>;
};

const fragranceFamilies = ["Woody Oud", "Oriental", "Floral", "Fresh", "Amber", "Musk"];

export function ProductForm({ initial }: { initial?: Initial }) {
  const action = saveProduct.bind(null, initial?.id);
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [name, setName] = useState(initial?.nameEn ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "DRAFT");
  const currentMain = initial?.media.find((media) => media.type === "MAIN_IMAGE" && media.isPrimary) ?? initial?.media.find((media) => media.type === "MAIN_IMAGE");
  const currentDetails = initial?.media.filter((media) => media.type === "DETAIL_IMAGE") ?? [];
  const currentVideo = initial?.media.find((media) => media.type === "VIDEO");
  const [mainPreview, setMainPreview] = useState(currentMain?.url ?? "");
  const [detailPreviews, setDetailPreviews] = useState<string[]>([]);
  const [videoName, setVideoName] = useState("");

  return (
    <form action={formAction} className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-7">
        {state.error ? <div className="flex items-start gap-3 bg-red-50 px-5 py-4 text-sm text-red-800" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" /><div><p className="font-medium">商品保存失败</p><p className="mt-1 text-red-700">{state.error}</p></div></div> : null}

        <Card className="border-0 bg-[#fffefa] shadow-[0_12px_40px_rgba(48,38,28,.05)]">
          <CardHeader className="border-b border-black/6 px-7 py-6"><CardTitle className="font-display text-2xl font-medium">基础商品信息</CardTitle><CardDescription>完成一张主图和必要信息即可上架商品。</CardDescription></CardHeader>
          <CardContent className="grid gap-8 px-7 py-7 lg:grid-cols-[280px_1fr]">
            <div>
              <div className="mb-3 flex items-center justify-between"><Label>商品主图</Label><span className="text-xs text-red-700">必须 1 张</span></div>
              <label className="group relative block aspect-[4/5] cursor-pointer overflow-hidden bg-[#eee9df]">
                {mainPreview ? <Image src={mainPreview} alt="Main product preview" fill unoptimized={mainPreview.startsWith("blob:")} className="object-cover transition duration-500 group-hover:scale-[1.02]" /> : <div className="flex h-full flex-col items-center justify-center px-6 text-center"><ImagePlus className="size-7 text-black/35" /><p className="mt-3 text-sm font-medium">上传商品主图</p><p className="mt-1 text-xs leading-5 text-black/45">用于商品卡片和详情页首图<br />建议 4:5，最大 10MB</p></div>}
                <span className="absolute inset-x-0 bottom-0 bg-black/75 py-3 text-center text-xs text-white opacity-0 transition group-hover:opacity-100">{mainPreview ? "替换主图" : "选择图片"}</span>
                <input type="file" name="main_image" accept="image/jpeg,image/png,image/webp,image/avif" required={!currentMain} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setMainPreview(URL.createObjectURL(file)); }} />
              </label>
            </div>

            <div className="grid content-start gap-6 md:grid-cols-2">
              <div><Label htmlFor="name-en">商品名称 English</Label><Input id="name-en" name="name_en" required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 border-black/12 bg-white" placeholder="Desert Oud Diffuser" /></div>
              <div><Label htmlFor="name-ar">商品名称 Arabic</Label><Input id="name-ar" name="name_ar" dir="rtl" required defaultValue={initial?.nameAr} className="mt-2 h-11 border-black/12 bg-white" placeholder="ناشر عطر عود الصحراء" /></div>
              <div><Label htmlFor="category">分类</Label><Input id="category" name="category" required defaultValue={initial?.category} className="mt-2 h-11 border-black/12 bg-white" placeholder="Home Fragrance" /></div>
              <div><Label htmlFor="fragrance-family">香氛类型</Label><Input id="fragrance-family" name="fragrance_family" list="fragrance-family-options" required defaultValue={initial?.fragranceFamily} className="mt-2 h-11 border-black/12 bg-white" placeholder="Woody Oud" /><datalist id="fragrance-family-options">{fragranceFamilies.map((family) => <option key={family} value={family} />)}</datalist></div>
              <div><Label htmlFor="price">价格 SAR</Label><Input id="price" type="number" min="0.01" step="0.01" name="price_sar" required value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2 h-11 border-black/12 bg-white" /></div>
              <div><Label htmlFor="compare">划线价格</Label><Input id="compare" type="number" min="0" step="0.01" name="compare_price" defaultValue={initial?.compareAtPrice} className="mt-2 h-11 border-black/12 bg-white" placeholder="可选" /></div>
              <div><Label htmlFor="stock">库存</Label><Input id="stock" type="number" min="0" name="stock" required defaultValue={initial?.stock ?? 0} className="mt-2 h-11 border-black/12 bg-white" /></div>
              <div><Label htmlFor="status">状态</Label><select id="status" name="status" value={status} onChange={(event) => setStatus(event.target.value as ProductStatus)} className="mt-2 h-11 w-full rounded-lg border border-black/12 bg-white px-3 text-sm"><option value="DRAFT">草稿 / 未上架</option><option value="ACTIVE">已上架</option><option value="ARCHIVED">已归档</option></select></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[#fffefa] shadow-[0_12px_40px_rgba(48,38,28,.05)]">
          <CardHeader className="border-b border-black/6 px-7 py-6"><CardTitle className="font-display text-2xl font-medium">商品图片管理</CardTitle><CardDescription>详情图片建议上传 3–6 张，按顺序展示在商品详情页。</CardDescription></CardHeader>
          <CardContent className="space-y-9 px-7 py-7">
            <section>
              <div className="flex items-end justify-between gap-4"><div><h3 className="text-sm font-medium">Detail Images</h3><p className="mt-1 text-xs text-black/45">支持拖放选择，保存前可设置展示顺序或删除。</p></div><span className="text-xs text-black/45">最多 6 张</span></div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {currentDetails.map((media, index) => <article key={media.id} className="bg-[#f4f0e8] p-2"><div className="relative aspect-square overflow-hidden bg-white"><Image src={media.url} alt="Detail product media" fill className="object-cover" /></div><div className="mt-2 flex items-center gap-2"><ArrowUpDown className="size-3.5 text-black/35" /><Input aria-label="Display order" name={`media_sort_${media.id}`} type="number" min="1" defaultValue={media.sortOrder || index + 1} className="h-8 w-16 border-0 bg-white text-xs" /><label className="ml-auto flex cursor-pointer items-center gap-1 text-xs text-red-700"><input type="checkbox" name="delete_media" value={media.id} className="sr-only peer" /><Trash2 className="size-3.5 peer-checked:fill-red-100" /><span className="peer-checked:font-semibold">删除</span></label></div></article>)}
                {detailPreviews.map((url, index) => <div key={url} className="relative aspect-square overflow-hidden bg-[#f4f0e8]"><Image src={url} alt={`New detail ${index + 1}`} fill unoptimized className="object-cover" /><Badge className="absolute left-2 top-2 rounded-none bg-white text-[10px] text-black">NEW</Badge></div>)}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center border border-dashed border-black/20 bg-[#faf7f1] text-center transition hover:border-black"><ImagePlus className="size-6 text-black/35" /><span className="mt-2 text-xs font-medium">添加详情图</span><span className="mt-1 text-[10px] text-black/40">可多选</span><input type="file" name="detail_images" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(event) => setDetailPreviews(Array.from(event.target.files ?? []).map((file) => URL.createObjectURL(file)))} /></label>
              </div>
            </section>

            <section className="border-t border-black/8 pt-8">
              <h3 className="text-sm font-medium">Video <span className="font-normal text-black/40">· 可选</span></h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr]">
                {currentVideo ? <div className="bg-[#f4f0e8] p-2"><video src={currentVideo.url} controls className="aspect-video w-full bg-black object-cover" /><label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-red-700"><input type="checkbox" name="delete_media" value={currentVideo.id} /><Trash2 className="size-3.5" />删除当前视频</label></div> : null}
                <label className="flex min-h-32 cursor-pointer items-center justify-center gap-4 border border-dashed border-black/20 bg-[#faf7f1] px-6 transition hover:border-black"><Film className="size-6 text-black/35" /><span><span className="block text-sm font-medium">{videoName || (currentVideo ? "替换视频" : "上传商品视频")}</span><span className="mt-1 block text-xs text-black/40">MP4 / WebM，最大 50MB</span></span><input type="file" name="video" accept="video/mp4,video/webm" className="sr-only" onChange={(event) => setVideoName(event.target.files?.[0]?.name ?? "")} /></label>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <Card className="border-0 bg-[#fffefa] shadow-[0_12px_40px_rgba(48,38,28,.06)]"><CardHeader><CardTitle className="font-display text-xl font-medium">上架预览</CardTitle></CardHeader><div className="relative mx-5 aspect-[4/5] overflow-hidden bg-[#eee9df]">{mainPreview ? <Image src={mainPreview} alt="Preview" fill unoptimized={mainPreview.startsWith("blob:")} className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-black/35">等待上传主图</div>}</div><CardContent className="pt-5"><div className="flex items-start justify-between gap-3"><div><p className="font-display text-2xl">{name || "Product name"}</p><Badge variant="outline" className="mt-3 rounded-none border-black/15 text-[10px]">{status}</Badge></div><p className="shrink-0 text-sm font-medium">{price || "0"} SAR</p></div></CardContent></Card>
        <div className="grid gap-2"><Button type="submit" disabled={pending} className="h-12 rounded-none bg-black text-white hover:bg-black/80"><Save />{pending ? "正在上传并保存…" : initial ? "保存修改" : "创建商品"}</Button><Button variant="ghost" nativeButton={false} render={<Link href="/admin/products" />} className="h-11 rounded-none">取消</Button></div>
        <p className="px-2 text-center text-xs leading-5 text-black/42">保存时媒体将上传至 Supabase Storage，完成后自动更新前台。</p>
      </aside>
    </form>
  );
}
