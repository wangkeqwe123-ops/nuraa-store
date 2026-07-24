"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ProductMediaType } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteProductMedia, ensureProductMediaBucket, uploadProductMedia } from "@/lib/supabase-storage";

export type ProductFormState = { error: string | null };

const productSchema = z.object({
  name_en: z.string().trim().min(1, "请填写英文商品名称"),
  name_ar: z.string().trim().min(1, "请填写阿拉伯文商品名称"),
  category: z.string().trim().min(1, "请填写商品分类"),
  fragrance_family: z.string().trim().min(1, "请选择或填写香氛类型"),
  price_sar: z.coerce.number().positive("价格必须大于 0"),
  compare_price: z.union([z.literal(""), z.coerce.number().nonnegative()]),
  stock: z.coerce.number().int().nonnegative("库存不能小于 0"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  size: z.string().trim().optional().default(""),
  burn_time: z.string().trim().optional().default(""),
  material: z.string().trim().optional().default(""),
  ingredients: z.string().trim().optional().default(""),
  care_instructions: z.string().trim().optional().default(""),
  short_description_en: z.string().trim().optional().default(""),
  short_description_ar: z.string().trim().optional().default(""),
  story_en: z.string().trim().optional().default(""),
  story_ar: z.string().trim().optional().default(""),
  usage_en: z.string().trim().optional().default(""),
  usage_ar: z.string().trim().optional().default(""),
  top_notes_en: z.string().trim().optional().default(""),
  top_notes_ar: z.string().trim().optional().default(""),
  heart_notes_en: z.string().trim().optional().default(""),
  heart_notes_ar: z.string().trim().optional().default(""),
  base_notes_en: z.string().trim().optional().default(""),
  base_notes_ar: z.string().trim().optional().default(""),
  usage_occasions_en: z.string().trim().optional().default(""),
  usage_occasions_ar: z.string().trim().optional().default(""),
  meta_title_en: z.string().trim().max(70, "英文 Meta Title 建议不超过 70 个字符").optional().default(""),
  meta_title_ar: z.string().trim().max(70, "阿拉伯文 Meta Title 建议不超过 70 个字符").optional().default(""),
  meta_description_en: z.string().trim().max(180, "英文 Meta Description 建议不超过 180 个字符").optional().default(""),
  meta_description_ar: z.string().trim().max(180, "阿拉伯文 Meta Description 建议不超过 180 个字符").optional().default(""),
  video_url: z.union([z.literal(""), z.string().trim().url("视频 URL 格式不正确")]).optional().default(""),
});

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const videoTypes = ["video/mp4", "video/webm"];

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `product-${Date.now()}`;

const files = (formData: FormData, name: string) =>
  formData.getAll(name).filter((value): value is File => value instanceof File && value.size > 0);

const list = (value: string) =>
  value
    .split(/[\n,،]+/)
    .map((item) => item.trim())
    .filter(Boolean);

function validateFile(file: File, kind: "image" | "video") {
  const allowed = kind === "image" ? imageTypes : videoTypes;
  const maxSize = kind === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  if (!allowed.includes(file.type)) throw new Error(`${file.name} 格式不支持，仅允许${kind === "image" ? " JPEG、PNG、WebP、AVIF" : " MP4、WebM"}`);
  if (file.size > maxSize) throw new Error(`${file.name} 超过 ${kind === "image" ? "10MB" : "50MB"} 限制`);
}

async function getCategoryId(name: string) {
  const slug = slugify(name);
  const category = await db.category.upsert({
    where: { slug },
    update: { isActive: true },
    create: { slug, translations: { create: [{ locale: "EN", name }, { locale: "AR", name }] } },
  });
  return category.id;
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  return (await db.product.findUnique({ where: { slug: base } })) ? `${base}-${Date.now().toString().slice(-6)}` : base;
}

async function uploadFile(file: File, productId: string, type: ProductMediaType, sortOrder: number, isPrimary: boolean) {
  validateFile(file, type === "VIDEO" ? "video" : "image");
  const extension = file.name.split(".").pop()?.toLowerCase() || (type === "VIDEO" ? "mp4" : "jpg");
  const fileName = `${randomUUID()}.${extension}`;
  try {
    const { url } = await uploadProductMedia(file, productId, fileName);
    return { productId, type, url, fileName, mimeType: file.type, sortOrder, isPrimary };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "未知错误";
    throw new Error(`上传 ${file.name} 失败：${reason}`);
  }
}

export async function saveProduct(id: string | undefined, _previousState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  let createdProductId: string | null = null;
  const uploadedUrls: string[] = [];

  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0]?.message || "请检查商品信息" };
    const data = parsed.data;

    const mainImage = files(formData, "main_image")[0];
    const detailImages = files(formData, "detail_images");
    const lifestyleImages = files(formData, "lifestyle_images");
    const video = files(formData, "video")[0];
    const current = id
      ? await db.product.findFirst({ where: { id, deletedAt: null }, include: { media: { orderBy: { sortOrder: "asc" } } } })
      : null;
    if (id && !current) return { error: "商品不存在或已被删除" };

    const deleteIds = new Set(formData.getAll("delete_media").map(String));
    const currentMedia = current?.media ?? [];
    const keptMain = currentMedia.filter((item) => item.type === "MAIN_IMAGE" && !deleteIds.has(item.id));
    const keptDetails = currentMedia.filter((item) => item.type === "DETAIL_IMAGE" && !deleteIds.has(item.id));
    const keptLifestyle = currentMedia.filter((item) => item.type === "LIFESTYLE_IMAGE" && !deleteIds.has(item.id));
    if (!mainImage && keptMain.length === 0) return { error: "商品主图为必填项，请上传 1 张主图" };
    if (detailImages.length + keptDetails.length > 6) return { error: "详情图片最多支持 6 张，请删除部分图片后再保存" };
    if (lifestyleImages.length + keptLifestyle.length > 3) return { error: "Lifestyle 图片最多支持 3 张" };
    if (files(formData, "main_image").length > 1) return { error: "商品主图只能上传 1 张" };
    if (files(formData, "video").length > 1) return { error: "商品视频只能上传 1 个" };
    if (video && data.video_url) return { error: "视频文件和视频 URL 请只选择一种方式" };

    if (mainImage) validateFile(mainImage, "image");
    detailImages.forEach((file) => validateFile(file, "image"));
    lifestyleImages.forEach((file) => validateFile(file, "image"));
    if (video) validateFile(video, "video");
    await ensureProductMediaBucket();

    const categoryId = await getCategoryId(data.category);
    let productId = id;
    if (!productId) {
      const product = await db.product.create({
        data: {
          slug: await uniqueSlug(data.name_en),
          sku: `NUR-${randomUUID().slice(0, 8).toUpperCase()}`,
          categoryId,
          fragranceFamily: data.fragrance_family,
          size: data.size || null,
          burnTime: data.burn_time || null,
          material: data.material || null,
          ingredients: data.ingredients || null,
          careInstructions: data.care_instructions || null,
          price: data.price_sar,
          compareAtPrice: data.compare_price === "" ? null : data.compare_price,
          currency: "SAR",
          stock: data.stock,
          status: data.status,
          translations: {
            create: [
              {
                locale: "EN",
                name: data.name_en,
                shortDescription: data.short_description_en || null,
                description: data.short_description_en || data.name_en,
                benefits: [],
                usage: data.usage_en || null,
                fragranceNotes: [],
                topNotes: list(data.top_notes_en),
                heartNotes: list(data.heart_notes_en),
                baseNotes: list(data.base_notes_en),
                usageOccasions: list(data.usage_occasions_en),
                story: data.story_en || null,
                metaTitle: data.meta_title_en || null,
                metaDescription: data.meta_description_en || null,
              },
              {
                locale: "AR",
                name: data.name_ar,
                shortDescription: data.short_description_ar || null,
                description: data.short_description_ar || data.name_ar,
                benefits: [],
                usage: data.usage_ar || null,
                fragranceNotes: [],
                topNotes: list(data.top_notes_ar),
                heartNotes: list(data.heart_notes_ar),
                baseNotes: list(data.base_notes_ar),
                usageOccasions: list(data.usage_occasions_ar),
                story: data.story_ar || null,
                metaTitle: data.meta_title_ar || null,
                metaDescription: data.meta_description_ar || null,
              },
            ],
          },
        },
      });
      productId = product.id;
      createdProductId = product.id;
    }

    const newMedia: Awaited<ReturnType<typeof uploadFile>>[] = [];
    if (mainImage) {
      const item = await uploadFile(mainImage, productId, "MAIN_IMAGE", 0, true);
      uploadedUrls.push(item.url);
      newMedia.push(item);
    }
    for (const [index, file] of detailImages.entries()) {
      const item = await uploadFile(file, productId, "DETAIL_IMAGE", keptDetails.length + index + 1, false);
      uploadedUrls.push(item.url);
      newMedia.push(item);
    }
    for (const [index, file] of lifestyleImages.entries()) {
      const item = await uploadFile(file, productId, "LIFESTYLE_IMAGE", 20 + keptLifestyle.length + index, false);
      uploadedUrls.push(item.url);
      newMedia.push(item);
    }
    if (video) {
      const item = await uploadFile(video, productId, "VIDEO", 100, false);
      uploadedUrls.push(item.url);
      newMedia.push(item);
    } else if (data.video_url) {
      newMedia.push({
        productId,
        type: "VIDEO",
        url: data.video_url,
        fileName: "external-video",
        mimeType: "video/external",
        sortOrder: 100,
        isPrimary: false,
      });
    }

    const replacedIds = new Set([
      ...(mainImage ? currentMedia.filter((item) => item.type === "MAIN_IMAGE").map((item) => item.id) : []),
      ...(video || data.video_url ? currentMedia.filter((item) => item.type === "VIDEO").map((item) => item.id) : []),
    ]);
    const removedMedia = currentMedia.filter((item) => deleteIds.has(item.id) || replacedIds.has(item.id));

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          categoryId,
          fragranceFamily: data.fragrance_family,
          size: data.size || null,
          burnTime: data.burn_time || null,
          material: data.material || null,
          ingredients: data.ingredients || null,
          careInstructions: data.care_instructions || null,
          price: data.price_sar,
          compareAtPrice: data.compare_price === "" ? null : data.compare_price,
          stock: data.stock,
          status: data.status,
        },
      });
      await tx.productTranslation.upsert({
        where: { productId_locale: { productId, locale: "EN" } },
        update: {
          name: data.name_en,
          shortDescription: data.short_description_en || null,
          description: data.short_description_en || data.name_en,
          usage: data.usage_en || null,
          topNotes: list(data.top_notes_en),
          heartNotes: list(data.heart_notes_en),
          baseNotes: list(data.base_notes_en),
          usageOccasions: list(data.usage_occasions_en),
          story: data.story_en || null,
          metaTitle: data.meta_title_en || null,
          metaDescription: data.meta_description_en || null,
        },
        create: {
          productId,
          locale: "EN",
          name: data.name_en,
          shortDescription: data.short_description_en || null,
          description: data.short_description_en || data.name_en,
          benefits: [],
          usage: data.usage_en || null,
          fragranceNotes: [],
          topNotes: list(data.top_notes_en),
          heartNotes: list(data.heart_notes_en),
          baseNotes: list(data.base_notes_en),
          usageOccasions: list(data.usage_occasions_en),
          story: data.story_en || null,
          metaTitle: data.meta_title_en || null,
          metaDescription: data.meta_description_en || null,
        },
      });
      await tx.productTranslation.upsert({
        where: { productId_locale: { productId, locale: "AR" } },
        update: {
          name: data.name_ar,
          shortDescription: data.short_description_ar || null,
          description: data.short_description_ar || data.name_ar,
          usage: data.usage_ar || null,
          topNotes: list(data.top_notes_ar),
          heartNotes: list(data.heart_notes_ar),
          baseNotes: list(data.base_notes_ar),
          usageOccasions: list(data.usage_occasions_ar),
          story: data.story_ar || null,
          metaTitle: data.meta_title_ar || null,
          metaDescription: data.meta_description_ar || null,
        },
        create: {
          productId,
          locale: "AR",
          name: data.name_ar,
          shortDescription: data.short_description_ar || null,
          description: data.short_description_ar || data.name_ar,
          benefits: [],
          usage: data.usage_ar || null,
          fragranceNotes: [],
          topNotes: list(data.top_notes_ar),
          heartNotes: list(data.heart_notes_ar),
          baseNotes: list(data.base_notes_ar),
          usageOccasions: list(data.usage_occasions_ar),
          story: data.story_ar || null,
          metaTitle: data.meta_title_ar || null,
          metaDescription: data.meta_description_ar || null,
        },
      });
      if (removedMedia.length) await tx.productMedia.deleteMany({ where: { productId, id: { in: removedMedia.map((item) => item.id) } } });
      for (const [index, media] of keptDetails.entries()) {
        if (removedMedia.some((item) => item.id === media.id)) continue;
        await tx.productMedia.update({ where: { id: media.id }, data: { sortOrder: Number(formData.get(`media_sort_${media.id}`) ?? index + 1), isPrimary: false } });
      }
      for (const [index, media] of keptLifestyle.entries()) {
        if (removedMedia.some((item) => item.id === media.id)) continue;
        await tx.productMedia.update({
          where: { id: media.id },
          data: {
            sortOrder: Number(formData.get(`media_sort_${media.id}`) ?? 20 + index),
            isPrimary: false,
          },
        });
      }
      if (!mainImage && keptMain[0]) await tx.productMedia.update({ where: { id: keptMain[0].id }, data: { sortOrder: 0, isPrimary: true } });
      if (newMedia.length) await tx.productMedia.createMany({ data: newMedia });
    });

    for (const item of removedMedia) {
      try { await deleteProductMedia(item.url); } catch { /* A stale object must not undo a valid catalog save. */ }
    }
  } catch (error) {
    for (const url of uploadedUrls) {
      try { await deleteProductMedia(url); } catch { /* Best-effort cleanup after a failed save. */ }
    }
    if (createdProductId) {
      try { await db.product.delete({ where: { id: createdProductId } }); } catch { /* Preserve the original failure reason. */ }
    }
    return { error: error instanceof Error ? error.message : "保存商品失败，请稍后重试" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/en");
  revalidatePath("/ar");
  revalidatePath("/en/products");
  revalidatePath("/ar/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED" } });
  revalidatePath("/admin/products");
  revalidatePath("/en");
  revalidatePath("/ar");
}

export async function toggleProduct(id: string, current: "ACTIVE" | "DRAFT" | "ARCHIVED") {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { status: current === "ACTIVE" ? "DRAFT" : "ACTIVE" } });
  revalidatePath("/admin/products");
  revalidatePath("/en");
  revalidatePath("/ar");
}
