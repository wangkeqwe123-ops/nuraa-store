"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, Save, Trash2, Upload } from "lucide-react";
import {
  moveHomepageSection,
  saveHomepageSection,
  toggleHomepageSection,
  type HomepageSectionInput,
} from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CmsSection = HomepageSectionInput & {
  sectionKey: string;
  sortOrder: number;
  references: { desktop: string[]; mobile: string[] };
};

const moduleName = (key: string) => {
  if (key === "announcement_bar") return "Announcement Bar";
  if (key === "footer_brand") return "Footer Brand";
  if (key === "hero_banner") return "Hero Banner";
  if (key === "brand_story") return "Brand Story";
  if (key.startsWith("collection_")) return "Collection Banner";
  if (key.startsWith("gift_")) return "Gift Section";
  return "Journal Section";
};

const supportsMedia = (key: string) => !["announcement_bar", "footer_brand"].includes(key);

function MediaField({
  section,
  slot,
  value,
  onChange,
  storageConfigured,
}: {
  section: CmsSection;
  slot: "desktop" | "mobile";
  value: string | null;
  onChange: (url: string | null, type?: "IMAGE" | "VIDEO") => void;
  storageConfigured: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const references = section.references[slot];

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.set("file", file);
    form.set("sectionKey", section.sectionKey);
    const response = await fetch("/api/admin/homepage-media", { method: "POST", body: form });
    const result = await response.json();
    setUploading(false);
    if (!response.ok) {
      setError(result.error || "Upload failed");
      return;
    }
    onChange(result.url, result.mediaType);
  };

  const remove = async () => {
    if (!value) return;
    setError("");
    const response = await fetch("/api/admin/homepage-media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: section.id, slot }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Delete failed");
      return;
    }
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="capitalize">{slot} media</Label>
        <Badge variant="outline">{slot === "desktop" ? "16:9 / wide" : "4:5 / mobile"}</Badge>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
        {value ? (
          section.mediaType === "VIDEO" ? (
            <video src={value} controls muted className="size-full object-cover" />
          ) : (
            <Image
              src={value}
              alt=""
              fill
              unoptimized={value.startsWith("http")}
              className="object-cover"
            />
          )
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">
            No media selected
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Label className="cursor-pointer">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime"
            className="sr-only"
            disabled={!storageConfigured || uploading}
            onChange={(event) => upload(event.target.files?.[0])}
          />
          <span className="inline-flex h-8 items-center gap-2 rounded-lg border bg-white px-3 text-xs font-medium hover:bg-muted">
            <Upload className="size-3.5" />
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
          </span>
        </Label>
        {value ? (
          <Button type="button" variant="outline" size="sm" onClick={remove} className="text-destructive">
            <Trash2 />Delete
          </Button>
        ) : null}
      </div>
      {!storageConfigured ? (
        <p className="text-xs text-amber-700">Add Supabase Storage credentials to enable uploads.</p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
        <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
          <Eye className="size-3.5" />Media references
        </div>
        {references.length
          ? references.map((item) => <div key={item}>{item}</div>)
          : <div>Not currently used on a published page.</div>}
      </div>
    </div>
  );
}

function LocalizedFields({
  locale,
  section,
  update,
}: {
  locale: "English" | "Arabic";
  section: CmsSection;
  update: <K extends keyof CmsSection>(key: K, value: CmsSection[K]) => void;
}) {
  const arabic = locale === "Arabic";
  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div>
        <p className="text-sm font-semibold">{locale} content</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {arabic ? "Used on Arabic storefront pages." : "Used on English storefront pages and as the legacy fallback."}
        </p>
      </div>
      <div>
        <Label>{arabic ? "Title AR" : "Title EN"}</Label>
        <Input
          dir={arabic ? "rtl" : "ltr"}
          value={arabic ? section.titleAr : section.titleEn}
          onChange={(event) => update(arabic ? "titleAr" : "titleEn", event.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label>{arabic ? "Subtitle AR" : "Subtitle EN"}</Label>
        <Textarea
          dir={arabic ? "rtl" : "ltr"}
          value={arabic ? section.subtitleAr : section.subtitleEn}
          onChange={(event) => update(arabic ? "subtitleAr" : "subtitleEn", event.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label>{arabic ? "CTA text AR" : "CTA text EN"}</Label>
        <Input
          dir={arabic ? "rtl" : "ltr"}
          value={arabic ? section.ctaTextAr : section.ctaTextEn}
          onChange={(event) => update(arabic ? "ctaTextAr" : "ctaTextEn", event.target.value)}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function SectionEditor({
  initial,
  storageConfigured,
}: {
  initial: CmsSection;
  storageConfigured: boolean;
}) {
  const router = useRouter();
  const [section, setSection] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof CmsSection>(key: K, value: CmsSection[K]) => {
    setSaved(false);
    setSection((current) => ({ ...current, [key]: value }));
  };

  const save = () => startTransition(async () => {
    await saveHomepageSection(section);
    setSaved(true);
    router.refresh();
  });
  const reorder = (direction: "up" | "down") => startTransition(async () => {
    await moveHomepageSection(section.id, direction);
    router.refresh();
  });
  const toggle = () => startTransition(async () => {
    await toggleHomepageSection(section.id);
    setSection((current) => ({
      ...current,
      status: current.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    }));
    router.refresh();
  });

  return (
    <Card className="overflow-hidden border-[#12372a]/10 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-white">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="outline">{moduleName(section.sectionKey)}</Badge>
            <Badge className={section.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>
              {section.status === "ACTIVE" ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <CardTitle className="text-lg">{section.sectionKey}</CardTitle>
        </div>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => reorder("up")} aria-label="Move up">
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => reorder("down")} aria-label="Move down">
            <ArrowDown />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-5">
        <div className="grid gap-4 xl:grid-cols-2">
          <LocalizedFields locale="English" section={section} update={update} />
          <LocalizedFields locale="Arabic" section={section} update={update} />
        </div>
        <div>
          <Label>CTA link</Label>
          <Input value={section.ctaLink} onChange={(event) => update("ctaLink", event.target.value)} className="mt-2" />
          <p className="mt-1.5 text-xs text-muted-foreground">Shared by English and Arabic content. Relative paths and anchors are supported.</p>
        </div>
        {supportsMedia(section.sectionKey) ? (
          <>
            <div>
              <Label>Media type</Label>
              <select
                value={section.mediaType}
                onChange={(event) => update("mediaType", event.target.value as "IMAGE" | "VIDEO")}
                className="mt-2 h-9 w-full rounded-lg border bg-white px-3 text-sm"
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <MediaField
                section={section}
                slot="desktop"
                value={section.desktopMediaUrl}
                storageConfigured={storageConfigured}
                onChange={(url, type) => {
                  update("desktopMediaUrl", url);
                  if (type) update("mediaType", type);
                }}
              />
              <MediaField
                section={section}
                slot="mobile"
                value={section.mobileMediaUrl}
                storageConfigured={storageConfigured}
                onChange={(url, type) => {
                  update("mobileMediaUrl", url);
                  if (type) update("mediaType", type);
                }}
              />
            </div>
          </>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <Button type="button" variant="outline" onClick={toggle}>
            {section.status === "ACTIVE" ? "Disable section" : "Enable section"}
          </Button>
          <div className="flex items-center gap-3">
            {saved ? <span className="text-xs text-emerald-700">Saved and published</span> : null}
            <Button type="button" onClick={save} disabled={pending} className="bg-[#12372a] hover:bg-[#0d2b21]">
              <Save />{pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HomepageCms({
  sections,
  storageConfigured,
}: {
  sections: CmsSection[];
  storageConfigured: boolean;
}) {
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <SectionEditor key={section.id} initial={section} storageConfigured={storageConfigured} />
      ))}
    </div>
  );
}
