import { CopyButton } from "@kentos/components/common/copy-button";
import { cn } from "@kentos/components/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

/** A showcase page: a title, what the components are for, then demos. */
export function Page({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-8 sm:px-8">
      <header className="grid gap-2">
        <h1 className="font-semibold text-2xl tracking-(--tracking-tight)">{title}</h1>
        <div className="max-w-3xl text-muted-foreground leading-relaxed">{description}</div>
      </header>
      {children}
    </article>
  );
}

/** One example: a live preview and the code that renders it. */
export function Demo({
  title,
  description,
  code,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  code: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = title.toLocaleLowerCase("tr").replace(/[^a-z0-9ğüşıöç]+/g, "-");
  return (
    <section id={id} className="grid scroll-mt-20 gap-3">
      <div>
        <h2 className="font-semibold text-lg">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-muted-foreground text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      <div className="card overflow-hidden">
        <div className={cn("flex flex-wrap items-center gap-3 p-6", className)}>{children}</div>
        <div className="border-t">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="flex w-full items-center gap-1.5 px-4 py-2 text-left text-muted-foreground text-sm hover:text-foreground"
          >
            <ChevronDownIcon className={cn("size-4 transition-transform", open && "rotate-180")} />
            {open ? "Kodu gizle" : "Kodu göster"}
          </button>
          {open ? (
            <div className="relative border-t bg-sunken">
              <pre className="overflow-x-auto p-4 pr-12 font-mono text-sm leading-relaxed">
                <code>{code.trim()}</code>
              </pre>
              <CopyButton value={code.trim()} className="absolute top-2 right-2" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** A label with its value, for token tables. */
export function Swatch({ name, value, className }: { name: string; value: string; className?: string }) {
  return (
    <div className="grid gap-1.5">
      <div className={cn("h-12 rounded-md border", className)} style={{ background: value }} />
      <code className="truncate text-2xs text-muted-foreground">{name}</code>
    </div>
  );
}
