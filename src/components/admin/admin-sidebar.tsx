"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, Boxes, LayoutDashboard, Megaphone, PackageCheck, Settings, ShoppingBag, Users, ExternalLink } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";

const nav=[
  {label:"Dashboard",href:"/admin",icon:LayoutDashboard},
  {label:"Homepage CMS",href:"/admin/homepage",icon:LayoutDashboard},
  {label:"Products",href:"/admin/products",icon:Boxes},
  {label:"Orders",href:"/admin/orders",icon:PackageCheck},
  {label:"Customers",href:"/admin/customers",icon:Users},
  {label:"Analytics",href:"/admin/analytics",icon:BarChart3},
  {label:"Marketing",href:"/admin/marketing",icon:Megaphone},
  {label:"AI Assistant",href:"/admin/ai-assistant",icon:Bot},
  {label:"Settings",href:"/admin/settings",icon:Settings},
];

export function AdminSidebar(){const pathname=usePathname();return <Sidebar collapsible="icon" className="border-none"><SidebarHeader className="p-4"><Link href="/admin" className="flex h-10 items-center gap-3 overflow-hidden"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#c9a227] font-display text-lg font-bold text-[#12372a]">N</span><span className="font-display text-xl font-semibold tracking-[.15em] text-white">NURAA</span></Link><p className="px-1 text-[9px] uppercase tracking-[.22em] text-white/40 group-data-[collapsible=icon]:hidden">Operations center</p></SidebarHeader><SidebarContent><SidebarGroup><SidebarGroupLabel className="text-white/35">Workspace</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{nav.map(({label,href,icon:Icon})=>{const active=href==="/admin"?pathname===href:pathname.startsWith(href);return <SidebarMenuItem key={href}><SidebarMenuButton render={<Link href={href}/>} isActive={active} tooltip={label} className="h-10 px-3 text-white/68 data-active:bg-white/10 data-active:text-white data-active:shadow-[inset_3px_0_0_#c9a227] hover:bg-white/8 hover:text-white"><Icon/><span>{label}</span></SidebarMenuButton></SidebarMenuItem>})}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent><SidebarFooter className="p-3"><SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link href="/en" target="_blank"/>} tooltip="View store" className="text-white/55 hover:bg-white/8 hover:text-white"><ShoppingBag/><span>View Store</span><ExternalLink className="ml-auto size-3"/></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarFooter><SidebarRail/></Sidebar>}
