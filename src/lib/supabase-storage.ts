import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_HOMEPAGE_BUCKET = "homepage-media";
const DEFAULT_PRODUCT_BUCKET = "product-media";
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "video/mp4", "video/webm", "video/quicktime"];

const clean = (value?: string) => value?.trim().replace(/^(["'])(.*)\1$/, "$2");

function config() {
  const url = clean(process.env.SUPABASE_URL)?.replace(/\/$/, "");
  const serviceKey = clean(process.env.SUPABASE_SECRET_KEY) || clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey) throw new Error("Supabase Storage 未配置，请检查 SUPABASE_URL 和 SUPABASE_SECRET_KEY。");
  return {
    url,
    serviceKey,
    homepageBucket: clean(process.env.SUPABASE_HOMEPAGE_BUCKET) || DEFAULT_HOMEPAGE_BUCKET,
    productBucket: clean(process.env.SUPABASE_PRODUCT_BUCKET) || DEFAULT_PRODUCT_BUCKET,
  };
}

let client: SupabaseClient | null = null;
function storageClient() {
  if (client) return client;
  const { url, serviceKey } = config();
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

export function homepageStorageConfigured() {
  return Boolean(clean(process.env.SUPABASE_URL) && (clean(process.env.SUPABASE_SECRET_KEY) || clean(process.env.SUPABASE_SERVICE_ROLE_KEY)));
}

export const productStorageConfigured = homepageStorageConfigured;

async function ensureBucket(bucket: string) {
  const supabase = storageClient();
  const { data, error } = await supabase.storage.getBucket(bucket);
  if (data && !error) return;
  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 52_428_800,
    allowedMimeTypes,
  });
  if (createError) throw new Error(`无法访问或创建 ${bucket} bucket：${createError.message}`);
}

async function uploadToBucket(file: File, bucket: string, objectPath: string) {
  await ensureBucket(bucket);
  const supabase = storageClient();
  const { error } = await supabase.storage.from(bucket).upload(
    objectPath,
    Buffer.from(await file.arrayBuffer()),
    { contentType: file.type, cacheControl: "31536000", upsert: false },
  );
  if (error) throw new Error(`上传失败：${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}

function objectPathFromUrl(publicUrl: string, bucket: string) {
  if (!homepageStorageConfigured()) return null;
  const { url } = config();
  const prefix = `${url}/storage/v1/object/public/${bucket}/`;
  return publicUrl.startsWith(prefix) ? decodeURIComponent(publicUrl.slice(prefix.length)) : null;
}

async function deleteFromBucket(publicUrl: string, bucket: string) {
  const objectPath = objectPathFromUrl(publicUrl, bucket);
  if (!objectPath) return false;
  const { error } = await storageClient().storage.from(bucket).remove([objectPath]);
  if (error) throw new Error(`删除媒体失败：${error.message}`);
  return true;
}

export async function ensureHomepageBucket() { await ensureBucket(config().homepageBucket); }
export async function uploadHomepageMedia(file: File, objectPath: string) { return uploadToBucket(file, config().homepageBucket, objectPath); }
export function storageObjectPath(publicUrl: string) { return objectPathFromUrl(publicUrl, config().homepageBucket); }
export async function deleteHomepageMedia(publicUrl: string) { return deleteFromBucket(publicUrl, config().homepageBucket); }
export async function ensureProductMediaBucket() { await ensureBucket(config().productBucket); }
export async function uploadProductMedia(file: File, productId: string, fileName: string) {
  const objectPath = `${productId}/${fileName}`;
  const url = await uploadToBucket(file, config().productBucket, objectPath);
  return { url, objectPath };
}
export async function deleteProductMedia(publicUrl: string) { return deleteFromBucket(publicUrl, config().productBucket); }
