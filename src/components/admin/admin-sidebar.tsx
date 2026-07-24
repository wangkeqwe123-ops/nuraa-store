"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, Boxes, ExternalLink, House, LayoutDashboard, Megaphone, PackageCheck, PanelTop, Settings, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Homepage CMS", href: "/admin/homepage", icon: PanelTop },
  { label: "Products", href: "/admin/products", icon: Boxes },
  { label: "Orders", href: "/admin/orders", icon: PackageCheck },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "AI Assistant", href: "/admin/ai-assistant", icon: Bot },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-e border-white/8">
      <SidebarHeader className="px-4 pb-4 pt-5">
        <Link href="/admin" className="flex min-h-12 items-center gap-3 overflow-hidden rounded-md px-2">
          <span className="flex size-9 shrink-0 items-center justify-center border border-[#d2ad66]/60 font-display text-lg font-semibold text-[#e1c78f]">N</span>
          <span className="font-display text-xl font-semibold tracking-[.18em] text-white">NURAA</span>
        </Link>
        <p className="mt-1 px-2 text-[10px] font-medium text-white/42 group-data-[collapsible=icon]:hidden">Commerce operations</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-medium text-white/38">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {nav.map(({ label, href, icon: Icon }) => {
                const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={active}
                      tooltip={label}
                      className="h-11 rounded-md px-3 text-white/66 transition-colors data-active:bg-[#d2ad66] data-active:text-[#17251f] hover:bg-white/8 hover:text-white"
                    >
                      <Icon strokeWidth={1.7} />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/8 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/en" target="_blank" />} tooltip="View store" className="h-11 text-white/58 hover:bg-white/8 hover:text-white">
              <House />
              <span>View storefront</span>
              <ExternalLink className="ms-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
