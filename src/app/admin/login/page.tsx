import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await getAdmin()) redirect("/admin/products");

  return (
    <main className="grid min-h-screen bg-[#f7f6f2] lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,.95fr)]">
      <section className="relative hidden overflow-hidden bg-[#17251f] lg:block">
        <Image src="/images/brand-v2/essence-arabian-homes.png" alt="A warm Arabian interior prepared for welcoming guests" fill priority className="object-cover opacity-72" sizes="55vw" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,37,31,.12),rgba(23,37,31,.86))]" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16">
          <p className="font-display text-5xl font-semibold tracking-[.16em]">NURAA</p>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/76">A focused workspace for products, content, orders and storefront performance.</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="border-b border-[#17251f]/12 pb-8">
            <p className="font-display text-3xl font-semibold tracking-[.18em] text-[#17251f] lg:hidden">NURAA</p>
            <p className="text-sm font-medium text-[#8a621a]">Commerce operations</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.03em] text-[#17251f]">管理员登录</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">安全访问商品、库存、首页内容和销售数据。</p>
          </div>
          <LoginForm />
          <p className="mt-8 text-xs leading-5 text-muted-foreground">仅限授权的 NURAA 运营人员访问。</p>
        </div>
      </section>
    </main>
  );
}
