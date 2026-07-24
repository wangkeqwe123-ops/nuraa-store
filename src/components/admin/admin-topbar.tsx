"use client";

import { LogOut, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/app/admin/actions";

const pageNames: Record<string, string> = {
  homepage: "Homepage CMS",
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  analytics: "Analytics",
  marketing: "Marketing",
  "ai-assistant": "AI Assistant",
  settings: "Settings",
};

export function AdminTopbar({ email }: { email: string }) {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[1];
  const pageName = segment ? pageNames[segment] ?? "Workspace" : "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#17251f]/10 bg-[#f7f6f2]/96 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <a href="#admin-main" className="sr-only focus:not-sr-only">Skip to content</a>
      <SidebarTrigger aria-label="Toggle navigation" className="size-11 text-[#17251f]" />
      <p className="hidden min-w-28 text-sm font-semibold text-[#17251f] sm:block">{pageName}</p>
      <form action="/admin/products" className="relative hidden max-w-lg flex-1 md:block">
        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input name="q" aria-label="Search products" className="h-10 border-transparent bg-white ps-10 shadow-none focus-visible:border-[#17251f]/25" placeholder="Search products or SKU" />
      </form>
      <div className="ms-auto">
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Open admin account menu" className="flex min-h-11 items-center gap-2 rounded-md px-2 text-left transition-colors hover:bg-white">
            <Avatar className="size-8"><AvatarFallback className="bg-[#17251f] text-xs text-white">NA</AvatarFallback></Avatar>
            <div className="hidden md:block"><p className="text-xs font-semibold text-[#202520]">NURAA Admin</p><p className="max-w-48 truncate text-[11px] text-muted-foreground">{email}</p></div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Admin account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <form action={logoutAction}>
                <DropdownMenuItem nativeButton render={<button className="w-full" type="submit" />}>
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </form>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
