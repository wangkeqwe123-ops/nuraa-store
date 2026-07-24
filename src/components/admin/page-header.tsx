import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-[#17251f]/10 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="mb-1 text-xs font-medium text-[#8a621a]">{eyebrow}</p> : null}
        <h1 className="text-[30px] font-semibold leading-tight tracking-[-.03em] text-[#17251f] md:text-[36px]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
