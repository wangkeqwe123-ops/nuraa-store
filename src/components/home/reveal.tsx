"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({children,className,delay=0}:{children:ReactNode;className?:string;delay?:number}) {
  const ref=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{const element=ref.current;if(!element)return;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setVisible(true);observer.disconnect();}},{threshold:.12,rootMargin:"0px 0px -6% 0px"});observer.observe(element);return()=>observer.disconnect();},[]);
  return <div ref={ref} style={{transitionDelay:`${delay}ms`}} className={cn("reveal-block",visible&&"is-visible",className)}>{children}</div>;
}
