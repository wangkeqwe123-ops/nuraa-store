"use client";
import { useActionState } from "react";
import { loginAction } from "../actions";
export function LoginForm(){ const [state,action,pending]=useActionState(loginAction,{}); return <form action={action} className="mt-8 space-y-5">
  <label className="block text-sm font-medium">邮箱<input name="email" type="email" required autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#18342d]" placeholder="admin@nuraa.sa"/></label>
  <label className="block text-sm font-medium">密码<input name="password" type="password" required autoComplete="current-password" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#18342d]"/></label>
  {state.error&&<p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
  <button disabled={pending} className="h-12 w-full rounded-xl bg-[#18342d] text-sm font-semibold text-white disabled:opacity-60">{pending?"登录中…":"登录后台"}</button>
</form> }
