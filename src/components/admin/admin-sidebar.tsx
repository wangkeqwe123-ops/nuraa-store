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

export function AdminSidebar(){const pathname=usePathname();return <Sidebar collapsible="icon" className="border-e border-white/6"><SidebarHeader className="px-4 pb-5 pt-6"><Link href="/admin" className="flex min-h-11 items-center gap-3 overflow-hidden"><span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#d2ad66]/55 bg-[#d2ad66]/12 font-display text-xl font-semibold text-[#e1c78f]">N</span><span className="font-display text-xl font-semibold tracking-[.18em] text-white">NURAA</span></Link><p className="mt-1 px-1 text-[9px] font-medium uppercase tracking-[.24em] text-white/38 group-data-[collapsible=icon]:hidden">Commerce studio</p></SidebarHeader><SidebarContent><SidebarGroup><SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[.16em] text-white/32">Workspace</SidebarGroupLabel><SidebarGroupContent><SidebarMenu className="gap-1">{nav.map(({label,href,icon:Icon})=>{const active=href==="/admin"?pathname===href:pathname.startsWith(href);return <SidebarMenuItem key={href}><SidebarMenuButton render={<Link href={href}/>} isActive={active} tooltip={label} className="h-11 rounded-lg px-3 text-white/62 transition-colors data-active:bg-white/10 data-active:text-white data-active:shadow-[inset_2px_0_0_#d2ad66] hover:bg-white/7 hover:text-white"><Icon strokeWidth={1.7}/><span>{label}</span></SidebarMenuButton></SidebarMenuItem>})}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent><SidebarFooter className="border-t border-white/7 p-3"><SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link href="/en" target="_blank"/>} tooltip="View store" className="h-11 text-white/55 hover:bg-white/8 hover:text-white"><ShoppingBag/><span>View Store</span><ExternalLink className="ml-auto size-3"/></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarFooter><SidebarRail/></Sidebar>}
