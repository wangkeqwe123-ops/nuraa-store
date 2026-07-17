"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

export function Reveal({children,className,delay=0}:{children:ReactNode;className?:string;delay?:number}) {
  const ref=useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);
    const element=ref.current;
    if(!element)return;
    const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduceMotion){gsap.set(element,{autoAlpha:1,y:0});return;}
    gsap.fromTo(element,{autoAlpha:0,y:28},{autoAlpha:1,y:0,duration:.9,delay:delay/1000,ease:"power3.out",scrollTrigger:{trigger:element,start:"top 88%",once:true}});
  },{scope:ref,dependencies:[delay]});
  return <div ref={ref} className={cn("reveal-block",className)}>{children}</div>;
}
