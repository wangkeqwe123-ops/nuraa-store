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
          nameEn: en?.name ?? "",
          nameAr: ar?.name ?? "",
          media: product.media.map((media) => ({ id: media.id, url: media.url, type: media.type, sortOrder: media.sortOrder, isPrimary: media.isPrimary })),
        }}
      />
    </>
  );
}
