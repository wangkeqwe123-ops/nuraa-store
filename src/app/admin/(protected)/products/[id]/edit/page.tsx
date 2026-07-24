import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { ProductForm } from "../../product-form";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      translations: true,
      media: { orderBy: { sortOrder: "asc" } },
      category: { include: { translations: true } },
    },
  });
  if (!product) notFound();

  const en = product.translations.find((translation) => translation.locale === "EN");
  const ar = product.translations.find((translation) => translation.locale === "AR");

  return (
    <>
      <PageHeader eyebrow="Products / Edit" title={en?.name ?? "Edit product"} description={`SKU ${product.sku}`} />
      <ProductForm
        initial={{
          id: product.id,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          stock: product.stock,
          status: product.status,
          category: product.category?.translations.find((translation) => translation.locale === "EN")?.name ?? product.category?.slug ?? "",
          fragranceFamily: product.fragranceFamily ?? en?.scentFamily ?? "",
          size: product.size ?? "",
          burnTime: product.burnTime ?? "",
          material: product.material ?? "",
          ingredients: product.ingredients ?? "",
          careInstructions: product.careInstructions ?? "",
          nameEn: en?.name ?? "",
          nameAr: ar?.name ?? "",
          shortDescriptionEn: en?.shortDescription ?? "",
          shortDescriptionAr: ar?.shortDescription ?? "",
          storyEn: en?.story ?? "",
          storyAr: ar?.story ?? "",
          usageEn: en?.usage ?? "",
          usageAr: ar?.usage ?? "",
          topNotesEn: en?.topNotes ?? [],
          topNotesAr: ar?.topNotes ?? [],
          heartNotesEn: en?.heartNotes ?? [],
          heartNotesAr: ar?.heartNotes ?? [],
          baseNotesEn: en?.baseNotes ?? [],
          baseNotesAr: ar?.baseNotes ?? [],
          usageOccasionsEn: en?.usageOccasions ?? [],
          usageOccasionsAr: ar?.usageOccasions ?? [],
          metaTitleEn: en?.metaTitle ?? "",
          metaTitleAr: ar?.metaTitle ?? "",
          metaDescriptionEn: en?.metaDescription ?? "",
          metaDescriptionAr: ar?.metaDescription ?? "",
          media: product.media.map((media) => ({
            id: media.id,
            url: media.url,
            type: media.type,
            sortOrder: media.sortOrder,
            isPrimary: media.isPrimary,
            mimeType: media.mimeType,
          })),
        }}
      />
    </>
  );
}
