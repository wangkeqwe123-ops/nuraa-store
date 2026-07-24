"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Play } from "lucide-react";
import type { StorefrontMedia } from "@/features/catalog/catalog.repository";

export function ProductMediaViewer({
  media,
  name,
  unoptimized = false,
}: {
  media: StorefrontMedia[];
  name: string;
  unoptimized?: boolean;
}) {
  const usable = media.length
    ? media
    : [{
        id: "placeholder",
        url: "/images/products/placeholder.jpg",
        type: "MAIN_IMAGE" as const,
        sortOrder: 0,
        isPrimary: true,
      }];
  const initial = usable.find((item) => item.isPrimary) ?? usable[0];
  const [selectedId, setSelectedId] = useState(initial.id);
  const selected = usable.find((item) => item.id === selectedId) ?? initial;
  const mobileRail = useRef<HTMLDivElement>(null);

  function selectMedia(id: string) {
    setSelectedId(id);
    const index = usable.findIndex((item) => item.id === id);
    const rail = mobileRail.current;
    if (rail && index >= 0) rail.scrollTo({ left: rail.clientWidth * index, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={mobileRail}
        onScroll={(event) => {
          const rail = event.currentTarget;
          const index = Math.round(rail.scrollLeft / Math.max(rail.clientWidth, 1));
          if (usable[index]) setSelectedId(usable[index].id);
        }}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto lg:hidden"
      >
        {usable.map((item, index) => (
          <div key={item.id} className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-[#f0ede7]">
            {item.type === "VIDEO" ? (
              <video src={item.url} controls playsInline preload="metadata" className="size-full object-contain" />
            ) : (
              <Image
                src={item.url}
                alt={`${name} ${index + 1}`}
                fill
                priority={index === 0}
                quality={90}
                unoptimized={unoptimized}
                sizes="100vw"
                className={item.type === "MAIN_IMAGE" ? "object-contain p-5" : "object-cover"}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {usable.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectMedia(item.id)}
            aria-label={`View product media ${index + 1}`}
            aria-current={item.id === selectedId ? "true" : undefined}
            className={`h-1.5 rounded-full transition-all ${item.id === selectedId ? "w-8 bg-[#17251f]" : "w-4 bg-black/20"}`}
          />
        ))}
      </div>

      <div className="hidden gap-5 lg:grid lg:grid-cols-[88px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          {usable.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              aria-label={`View product media ${index + 1}`}
              aria-current={item.id === selected.id ? "true" : undefined}
              className={`relative aspect-square w-full shrink-0 overflow-hidden border bg-[#f1eee8] transition duration-200 ${
                item.id === selected.id
                  ? "border-[#17251f]"
                  : "border-black/10 opacity-65 hover:opacity-100"
              }`}
            >
              {item.type === "VIDEO" ? (
                <>
                  <video src={item.url} muted preload="metadata" className="size-full object-cover" />
                  <span className="absolute inset-0 grid place-items-center bg-black/15">
                    <Play className="size-5 fill-white text-white" />
                  </span>
                </>
              ) : (
                <Image src={item.url} alt="" fill quality={85} unoptimized={unoptimized} className="object-cover" sizes="88px" />
              )}
            </button>
          ))}
        </div>

        <div className="relative aspect-[4/5] overflow-hidden bg-[#f0ede7]">
          {selected.type === "VIDEO" ? (
            <video key={selected.url} src={selected.url} controls playsInline preload="metadata" className="size-full object-contain" />
          ) : (
            <Image
              key={selected.url}
              src={selected.url}
              alt={name}
              fill
              priority
              quality={90}
              unoptimized={unoptimized}
              className={selected.type === "MAIN_IMAGE" ? "object-contain p-8" : "object-cover"}
              sizes="(min-width: 1536px) 720px, 52vw"
            />
          )}
        </div>
      </div>
    </div>
  );
}
