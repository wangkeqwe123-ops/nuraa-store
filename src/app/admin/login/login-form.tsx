"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-email">邮箱</Label>
        <Input id="admin-email" name="email" type="email" required autoComplete="email" className="h-12 bg-white" placeholder="admin@nuraa.sa" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-password">密码</Label>
        <Input id="admin-password" name="password" type="password" required autoComplete="current-password" className="h-12 bg-white" />
      </div>
      {state.error ? <p className="border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive" role="alert">{state.error}</p> : null}
      <Button type="submit" disabled={pending} size="lg" className="mt-1 h-12 bg-[#17251f] text-white hover:bg-[#243a31]">
        <LogIn data-icon="inline-start" />
        {pending ? "登录中…" : "登录后台"}
      </Button>
    </form>
  );
}
