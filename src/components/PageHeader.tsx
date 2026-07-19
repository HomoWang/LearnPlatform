import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b-2 border-dotted border-slate-300 pb-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="font-hn text-2xl text-ink">{title}</h1>
        {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
