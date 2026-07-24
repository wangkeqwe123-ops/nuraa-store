"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Film,
  ImagePlus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ProductMediaType, ProductStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { saveProduct } from "./actions";

type MediaItem = {
  id: string;
  url: string;
  type: ProductMediaType;
  sortOrder: number;
  isPrimary: boolean;
  mimeType: string | null;
};

type Initial = {
  id: string;
  price: string;
  compareAtPrice: string;
  stock: number;
  status: ProductStatus;
  category: string;
  fragranceFamily: string;
  size: string;
  burnTime: string;
  material: string;
  ingredients: string;
  careInstructions: string;
  nameEn: string;
  nameAr: string;
  shortDescriptionEn: string;
  shortDescriptionAr: string;
  storyEn: string;
  storyAr: string;
  usageEn: string;
  usageAr: string;
  topNotesEn: string[];
  topNotesAr: string[];
  heartNotesEn: string[];
  heartNotesAr: string[];
  baseNotesEn: string[];
  baseNotesAr: string[];
  usageOccasionsEn: string[];
  usageOccasionsAr: string[];
  metaTitleEn: string;
  metaTitleAr: string;
  metaDescriptionEn: string;
  metaDescriptionAr: string;
  media: MediaItem[];
};

const fragranceFamilies = ["Woody Oud", "Oriental", "Floral", "Fresh", "Amber", "Musk"];
const inputClass = "mt-2 h-11 border-black/12 bg-white";
const textareaClass = "mt-2 min-h-28 border-black/12 bg-white leading-6";

function MediaTile({ media, index }: { media: MediaItem; index: number }) {
  return (
    <article className="bg-[#f4f0e8] p-2">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={media.url}
          alt=""
          fill
          sizes="(min-width: 1280px) 180px, 33vw"
          className="object-cover"
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <ArrowUpDown className="size-3.5 text-black/35" />
        <Input
          aria-label="Display order"
          name={`media_sort_${media.id}`}
          type="number"
          min="0"
          defaultValue={media.sortOrder || index + 1}
          className="h-8 w-16 border-0 bg-white text-xs"
        />
        <label className="ml-auto flex cursor-pointer items-center gap-1 text-xs text-red-700">
          <input type="checkbox" name="delete_media" value={media.id} />
          <Trash2 className="size-3.5" />
          删除
        </label>
      </div>
    </article>
  );
}

function NewMediaPreview({ url, label }: { url: string; label: string }) {
  return (
    <div className="relative aspect-square overflow-hidden bg-[#f4f0e8]">
      <Image src={url} alt="" fill sizes="180px" unoptimized className="object-cover" />
      <Badge className="absolute left-2 top-2 rounded-sm bg-white text-[10px] text-black">
        {label}
      </Badge>
    </div>
  );
}

function LocaleFields({ locale, initial }: { locale: "en" | "ar"; initial?: Initial }) {
  const isArabic = locale === "ar";
  const suffix = isArabic ? "ar" : "en";
  const direction = isArabic ? "rtl" : "ltr";
  const values = isArabic
    ? {
        shortDescription: initial?.shortDescriptionAr,
        story: initial?.storyAr,
        usage: initial?.usageAr,
        top: initial?.topNotesAr,
        heart: initial?.heartNotesAr,
        base: initial?.baseNotesAr,
        occasions: initial?.usageOccasionsAr,
        metaTitle: initial?.metaTitleAr,
        metaDescription: initial?.metaDescriptionAr,
      }
    : {
        shortDescription: initial?.shortDescriptionEn,
        story: initial?.storyEn,
        usage: initial?.usageEn,
        top: initial?.topNotesEn,
        heart: initial?.heartNotesEn,
        base: initial?.baseNotesEn,
        occasions: initial?.usageOccasionsEn,
        metaTitle: initial?.metaTitleEn,
        metaDescription: initial?.metaDescriptionEn,
      };

  return (
    <div className="grid gap-6" dir={direction}>
      <div>
        <Label htmlFor={`short-description-${suffix}`}>简短描述</Label>
        <Textarea
          id={`short-description-${suffix}`}
          name={`short_description_${suffix}`}
          defaultValue={values.shortDescription}
          className={textareaClass}
          placeholder={isArabic ? "وصف مختصر للمنتج" : "A concise product introduction for the purchase area."}
        />
      </div>
      <div>
        <Label htmlFor={`story-${suffix}`}>产品故事与灵感</Label>
        <Textarea
          id={`story-${suffix}`}
          name={`story_${suffix}`}
          defaultValue={values.story}
          className="mt-2 min-h-40 border-black/12 bg-white leading-7"
          placeholder={isArabic ? "قصة العطر ومصدر الإلهام" : "The fragrance story, cultural inspiration and atmosphere."}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <Label htmlFor={`top-notes-${suffix}`}>Top Notes</Label>
          <Textarea
            id={`top-notes-${suffix}`}
            name={`top_notes_${suffix}`}
            defaultValue={values.top?.join(", ")}
            className={textareaClass}
            placeholder="Bergamot, Saffron"
          />
        </div>
        <div>
          <Label htmlFor={`heart-notes-${suffix}`}>Heart Notes</Label>
          <Textarea
            id={`heart-notes-${suffix}`}
            name={`heart_notes_${suffix}`}
            defaultValue={values.heart?.join(", ")}
            className={textareaClass}
            placeholder="Rose, Frankincense"
          />
        </div>
        <div>
          <Label htmlFor={`base-notes-${suffix}`}>Base Notes</Label>
          <Textarea
            id={`base-notes-${suffix}`}
            name={`base_notes_${suffix}`}
            defaultValue={values.base?.join(", ")}
            className={textareaClass}
            placeholder="Oud, Amber, Musk"
          />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor={`occasions-${suffix}`}>使用场景</Label>
          <Textarea
            id={`occasions-${suffix}`}
            name={`usage_occasions_${suffix}`}
            defaultValue={values.occasions?.join(", ")}
            className={textareaClass}
            placeholder={isArabic ? "المساء، المجلس، استقبال الضيوف" : "Evening, Majlis, Welcoming guests"}
          />
        </div>
        <div>
          <Label htmlFor={`usage-${suffix}`}>使用方法</Label>
          <Textarea
            id={`usage-${suffix}`}
            name={`usage_${suffix}`}
            defaultValue={values.usage}
            className={textareaClass}
            placeholder={isArabic ? "إرشادات الاستخدام" : "Usage guidance shown on the product page."}
          />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor={`meta-title-${suffix}`}>Meta Title</Label>
          <Input
            id={`meta-title-${suffix}`}
            name={`meta_title_${suffix}`}
            maxLength={70}
            defaultValue={values.metaTitle}
            className={inputClass}
          />
        </div>
        <div>
          <Label htmlFor={`meta-description-${suffix}`}>Meta Description</Label>
          <Textarea
            id={`meta-description-${suffix}`}
            name={`meta_description_${suffix}`}
            maxLength={180}
            defaultValue={values.metaDescription}
            className={textareaClass}
          />
        </div>
      </div>
    </div>
  );
}

export function ProductForm({ initial }: { initial?: Initial }) {
  const action = saveProduct.bind(null, initial?.id);
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [name, setName] = useState(initial?.nameEn ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "DRAFT");
  const currentMain =
    initial?.media.find((media) => media.type === "MAIN_IMAGE" && media.isPrimary)
    ?? initial?.media.find((media) => media.type === "MAIN_IMAGE");
  const currentDetails = initial?.media.filter((media) => media.type === "DETAIL_IMAGE") ?? [];
  const currentLifestyle =
    initial?.media.filter((media) => media.type === "LIFESTYLE_IMAGE") ?? [];
  const currentVideo = initial?.media.find((media) => media.type === "VIDEO");
  const [mainPreview, setMainPreview] = useState(currentMain?.url ?? "");
  const [detailPreviews, setDetailPreviews] = useState<string[]>([]);
  const [lifestylePreviews, setLifestylePreviews] = useState<string[]>([]);
  const [videoName, setVideoName] = useState("");

  return (
    <form action={formAction} className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-6">
        {state.error ? (
          <div className="flex items-start gap-3 bg-red-50 px-5 py-4 text-sm text-red-800" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">商品保存失败</p>
              <p className="mt-1 text-red-700">{state.error}</p>
            </div>
          </div>
        ) : null}

        <Card className="border-foreground/10 bg-card shadow-none">
          <CardHeader className="border-b border-foreground/8 px-7 py-6">
            <CardTitle className="text-lg font-semibold">商品基础信息</CardTitle>
            <CardDescription>主图、双语名称、价格与库存是商品上架的必要信息。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 px-7 py-7 lg:grid-cols-[280px_1fr]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label>商品主图</Label>
                <span className="text-xs text-red-700">必须 1 张</span>
              </div>
              <label className="group relative block aspect-[4/5] cursor-pointer overflow-hidden bg-[#eee9df]">
                {mainPreview ? (
                  <Image
                    src={mainPreview}
                    alt="Main product preview"
                    fill
                    priority
                    sizes="280px"
                    unoptimized={mainPreview.startsWith("blob:")}
                    className="object-contain p-3 transition duration-300 group-hover:scale-[1.01]"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <ImagePlus className="size-7 text-black/35" />
                    <p className="mt-3 text-sm font-medium">上传商品主图</p>
                    <p className="mt-1 text-xs leading-5 text-black/45">建议 4:5，WebP，最大 10MB</p>
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/75 py-3 text-center text-xs text-white opacity-0 transition group-hover:opacity-100">
                  {mainPreview ? "替换主图" : "选择图片"}
                </span>
                <input
                  type="file"
                  name="main_image"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  required={!currentMain}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setMainPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
            </div>

            <div className="grid content-start gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="name-en">商品名称 English</Label>
                <Input id="name-en" name="name_en" required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
              </div>
              <div>
                <Label htmlFor="name-ar">商品名称 Arabic</Label>
                <Input id="name-ar" name="name_ar" dir="rtl" required defaultValue={initial?.nameAr} className={inputClass} />
              </div>
              <div>
                <Label htmlFor="category">产品系列</Label>
                <Input id="category" name="category" required defaultValue={initial?.category} className={inputClass} placeholder="Desert Oud" />
              </div>
              <div>
                <Label htmlFor="fragrance-family">香氛类型</Label>
                <Input id="fragrance-family" name="fragrance_family" list="fragrance-family-options" required defaultValue={initial?.fragranceFamily} className={inputClass} placeholder="Woody Oud" />
                <datalist id="fragrance-family-options">
                  {fragranceFamilies.map((family) => <option key={family} value={family} />)}
                </datalist>
              </div>
              <div>
                <Label htmlFor="price">价格 SAR</Label>
                <Input id="price" type="number" min="0.01" step="0.01" name="price_sar" required value={price} onChange={(event) => setPrice(event.target.value)} className={inputClass} />
              </div>
              <div>
                <Label htmlFor="compare">划线价格</Label>
                <Input id="compare" type="number" min="0" step="0.01" name="compare_price" defaultValue={initial?.compareAtPrice} className={inputClass} />
              </div>
              <div>
                <Label htmlFor="stock">库存</Label>
                <Input id="stock" type="number" min="0" name="stock" required defaultValue={initial?.stock ?? 0} className={inputClass} />
              </div>
              <div>
                <Label htmlFor="status">状态</Label>
                <select id="status" name="status" value={status} onChange={(event) => setStatus(event.target.value as ProductStatus)} className="mt-2 h-11 w-full rounded-lg border border-black/12 bg-white px-3 text-sm">
                  <option value="DRAFT">草稿 / 未上架</option>
                  <option value="ACTIVE">已上架</option>
                  <option value="ARCHIVED">已归档</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-foreground/10 bg-card shadow-none">
          <CardHeader className="border-b border-foreground/8 px-7 py-6">
            <CardTitle className="text-lg font-semibold">商品媒体</CardTitle>
            <CardDescription>详情图 3–6 张，Lifestyle 图片最多 3 张；支持视频文件或外部 URL。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-9 px-7 py-7">
            <section>
              <h3 className="text-sm font-medium">Detail Images</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {currentDetails.map((media, index) => <MediaTile key={media.id} media={media} index={index} />)}
                {detailPreviews.map((url) => <NewMediaPreview key={url} url={url} label="DETAIL" />)}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center border border-dashed border-black/20 bg-[#faf7f1] text-center transition hover:border-black">
                  <ImagePlus className="size-6 text-black/35" />
                  <span className="mt-2 text-xs font-medium">添加详情图</span>
                  <input
                    type="file"
                    name="detail_images"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    className="sr-only"
                    onChange={(event) => setDetailPreviews(Array.from(event.target.files ?? []).map((file) => URL.createObjectURL(file)))}
                  />
                </label>
              </div>
            </section>

            <section className="border-t border-black/8 pt-8">
              <h3 className="text-sm font-medium">Lifestyle Images</h3>
              <p className="mt-1 text-xs text-black/45">用于品牌故事和空间氛围展示。</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {currentLifestyle.map((media, index) => <MediaTile key={media.id} media={media} index={index} />)}
                {lifestylePreviews.map((url) => <NewMediaPreview key={url} url={url} label="LIFESTYLE" />)}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center border border-dashed border-black/20 bg-[#faf7f1] text-center transition hover:border-black">
                  <Sparkles className="size-6 text-black/35" />
                  <span className="mt-2 text-xs font-medium">添加场景图</span>
                  <input
                    type="file"
                    name="lifestyle_images"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    className="sr-only"
                    onChange={(event) => setLifestylePreviews(Array.from(event.target.files ?? []).map((file) => URL.createObjectURL(file)))}
                  />
                </label>
              </div>
            </section>

            <section className="border-t border-black/8 pt-8">
              <h3 className="text-sm font-medium">Product Video</h3>
              <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
                {currentVideo ? (
                  <div className="bg-[#f4f0e8] p-2">
                    <video src={currentVideo.url} controls className="aspect-video w-full bg-black object-contain" />
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-red-700">
                      <input type="checkbox" name="delete_media" value={currentVideo.id} />
                      <Trash2 className="size-3.5" />
                      删除当前视频
                    </label>
                  </div>
                ) : null}
                <div className="grid gap-4">
                  <label className="flex min-h-28 cursor-pointer items-center gap-4 border border-dashed border-black/20 bg-[#faf7f1] px-6 transition hover:border-black">
                    <Film className="size-6 text-black/35" />
                    <span>
                      <span className="block text-sm font-medium">{videoName || "上传 MP4 / WebM"}</span>
                      <span className="mt-1 block text-xs text-black/40">最大 50MB</span>
                    </span>
                    <input type="file" name="video" accept="video/mp4,video/webm" className="sr-only" onChange={(event) => setVideoName(event.target.files?.[0]?.name ?? "")} />
                  </label>
                  <div>
                    <Label htmlFor="video-url">或使用视频 URL</Label>
                    <Input id="video-url" name="video_url" type="url" defaultValue={currentVideo?.url.startsWith("http") && currentVideo.mimeType === "video/external" ? currentVideo.url : ""} className={inputClass} placeholder="https://..." />
                  </div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        <Card className="border-foreground/10 bg-card shadow-none">
          <CardHeader className="border-b border-foreground/8 px-7 py-6">
            <CardTitle className="text-lg font-semibold">香氛内容与 SEO</CardTitle>
            <CardDescription>分别维护英文和阿拉伯文内容，列表使用逗号或换行分隔。</CardDescription>
          </CardHeader>
          <CardContent className="px-7 py-7">
            <Tabs defaultValue="en">
              <TabsList variant="line" className="mb-7">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>
              <TabsContent value="en"><LocaleFields locale="en" initial={initial} /></TabsContent>
              <TabsContent value="ar"><LocaleFields locale="ar" initial={initial} /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-foreground/10 bg-card shadow-none">
          <CardHeader className="border-b border-foreground/8 px-7 py-6">
            <CardTitle className="text-lg font-semibold">Ingredients & Details</CardTitle>
            <CardDescription>用于消费者详情页的产品规格、材质和护理说明。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 px-7 py-7 md:grid-cols-2">
            <div><Label htmlFor="size">Size</Label><Input id="size" name="size" defaultValue={initial?.size} className={inputClass} placeholder="200 ml / 220 g" /></div>
            <div><Label htmlFor="burn-time">Burn Time</Label><Input id="burn-time" name="burn_time" defaultValue={initial?.burnTime} className={inputClass} placeholder="Up to 55 hours" /></div>
            <div><Label htmlFor="material">Material</Label><Input id="material" name="material" defaultValue={initial?.material} className={inputClass} placeholder="Hand-poured wax / Glass vessel" /></div>
            <div className="md:col-span-2"><Label htmlFor="ingredients">Ingredients</Label><Textarea id="ingredients" name="ingredients" defaultValue={initial?.ingredients} className={textareaClass} /></div>
            <div className="md:col-span-2"><Label htmlFor="care-instructions">Care Instructions</Label><Textarea id="care-instructions" name="care_instructions" defaultValue={initial?.careInstructions} className={textareaClass} /></div>
          </CardContent>
        </Card>
      </div>

      <aside className="flex flex-col gap-5 xl:sticky xl:top-24 xl:self-start">
        <Card className="border-foreground/10 bg-card shadow-none">
          <CardHeader><CardTitle className="text-lg font-semibold">上架预览</CardTitle></CardHeader>
          <div className="relative mx-5 aspect-[4/5] overflow-hidden rounded-md bg-[#eee9df]">
            {mainPreview ? (
              <Image src={mainPreview} alt="" fill sizes="300px" unoptimized={mainPreview.startsWith("blob:")} className="object-contain p-3" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-black/35">等待上传主图</div>
            )}
          </div>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{name || "Product name"}</p>
                <Badge variant="outline" className="mt-3 rounded-sm border-black/15 text-[10px]">{status}</Badge>
              </div>
              <p className="shrink-0 text-sm font-medium">{price || "0"} SAR</p>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-2">
          <Button type="submit" disabled={pending} className="h-11">
            <Save data-icon="inline-start" />
            {pending ? "正在上传并保存…" : initial ? "保存修改" : "创建商品"}
          </Button>
          <Button variant="ghost" nativeButton={false} render={<Link href="/admin/products" />} className="h-10">取消</Button>
        </div>
        <p className="px-2 text-center text-xs leading-5 text-black/42">媒体将上传至 Supabase Storage，保存后前台自动刷新。</p>
      </aside>
    </form>
  );
}
