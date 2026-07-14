import "server-only";

const DEFAULT_HOMEPAGE_BUCKET = "homepage-media";
const DEFAULT_PRODUCT_BUCKET = "product-media";
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "video/mp4", "video/webm"];

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase Storage 未配置，请检查 SUPABASE_URL 和 SUPABASE_SECRET_KEY。");
  return {
    url,
    serviceKey,
    homepageBucket: process.env.SUPABASE_HOMEPAGE_BUCKET || DEFAULT_HOMEPAGE_BUCKET,
    productBucket: process.env.SUPABASE_PRODUCT_BUCKET || DEFAULT_PRODUCT_BUCKET,
  };
}

export function homepageStorageConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

export const productStorageConfigured = homepageStorageConfigured;

async function storageFetch(path: string, init: RequestInit = {}) {
  const { url, serviceKey } = config();
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceKey);
  if (!serviceKey.startsWith("sb_secret_")) headers.set("Authorization", `Bearer ${serviceKey}`);
  return fetch(`${url}/storage/v1${path}`, { ...init, headers, cache: "no-store" });
}

async function responseError(response: Response, fallback: string) {
  const body = await response.text();
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: string };
    return parsed.message || parsed.error || fallback;
  } catch {
    return body || fallback;
  }
}

async function ensureBucket(bucket: string) {
  const lookup = await storageFetch(`/bucket/${bucket}`);
  if (lookup.ok) return;
  if (lookup.status !== 404 && lookup.status !== 400) throw new Error(`无法检查 Supabase bucket：${await responseError(lookup, lookup.statusText)}`);
  const create = await storageFetch("/bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: bucket, name: bucket, public: true, file_size_limit: 52428800, allowed_mime_types: allowedMimeTypes }),
  });
  if (!create.ok) throw new Error(`无法创建 ${bucket} bucket：${await responseError(create, create.statusText)}`);
}

async function uploadToBucket(file: File, bucket: string, objectPath: string) {
  await ensureBucket(bucket);
  const { url } = config();
  const response = await storageFetch(`/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: { "Content-Type": file.type, "x-upsert": "false", "Cache-Control": "31536000" },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!response.ok) throw new Error(await responseError(response, `上传失败（HTTP ${response.status}）`));
  return `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
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
  const response = await storageFetch(`/object/${bucket}/${objectPath}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) throw new Error(`删除媒体失败：${await responseError(response, response.statusText)}`);
  return true;
}

export async function ensureHomepageBucket() {
  await ensureBucket(config().homepageBucket);
}

export async function uploadHomepageMedia(file: File, objectPath: string) {
  return uploadToBucket(file, config().homepageBucket, objectPath);
}

export function storageObjectPath(publicUrl: string) {
  return objectPathFromUrl(publicUrl, config().homepageBucket);
}

export async function deleteHomepageMedia(publicUrl: string) {
  return deleteFromBucket(publicUrl, config().homepageBucket);
}

export async function ensureProductMediaBucket() {
  await ensureBucket(config().productBucket);
}

export async function uploadProductMedia(file: File, productId: string, fileName: string) {
  const objectPath = `${productId}/${fileName}`;
  const url = await uploadToBucket(file, config().productBucket, objectPath);
  return { url, objectPath };
}

export async function deleteProductMedia(publicUrl: string) {
  return deleteFromBucket(publicUrl, config().productBucket);
}
