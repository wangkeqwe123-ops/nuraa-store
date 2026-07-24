"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit3, MoreHorizontal, Power, Trash2 } from "lucide-react";
import type { ProductStatus } from "@/generated/prisma/enums";
import {
  deleteProduct,
  toggleProduct,
} from "@/app/admin/(protected)/products/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ProductRowActionsProps = {
  id: string;
  status: ProductStatus;
};

export function ProductRowActions({ id, status }: ProductRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open product actions"
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link href={`/admin/products/${id}/edit`} />}>
              <Edit3 />
              Edit product
            </DropdownMenuItem>
            <form action={toggleProduct.bind(null, id, status)}>
              <DropdownMenuItem
                nativeButton
                render={<button type="submit" className="w-full" />}
              >
                <Power />
                {status === "ACTIVE" ? "Unpublish" : "Publish"}
              </DropdownMenuItem>
            </form>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              The product will be removed from the storefront and archived. It
              can still be recovered directly from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <form action={deleteProduct.bind(null, id)}>
              <AlertDialogAction type="submit" variant="destructive">
                Delete product
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
