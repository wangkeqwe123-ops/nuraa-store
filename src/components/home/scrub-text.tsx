"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

export function ScrubText({ text, className }: { text: string; className?: string }) {
  const root=useRef<HTMLParagraphElement>(null);
  const words=text.split(/\s+/);
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const spans=root.current?.querySelectorAll("[data-word]");
    if(!spans?.length)return;
    gsap.fromTo(spans,{opacity:.25},{opacity:1,stagger:.035,ease:"none",scrollTrigger:{trigger:root.current,start:"top 82%",end:"bottom 48%",scrub:true}});
  },{scope:root});
  return <p ref={root} className={cn("text-balance",className)} aria-label={text}>{words.map((word,index)=><span key={`${word}-${index}`} data-word aria-hidden="true">{word}{" "}</span>)}</p>;
}
