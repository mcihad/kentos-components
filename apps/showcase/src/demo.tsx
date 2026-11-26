import { CopyButton } from "@kentos/components/common/copy-button";
import { PageWrapper } from "@kentos/components/layout/page";
import { cn } from "@kentos/components/lib/utils";
import { Button } from "@kentos/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from "lucide-react";
import { type ComponentType, createContext, type ReactNode, useContext, useState } from "react";

/** What the shell knows about the current page: its icon and neighbours. */
export type PageMeta = {
  icon?: ComponentType<{ className?: string }>;
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
};

export const PageMetaContext = createContext<PageMeta>({});

/**
 * A showcase page on the kit's PageWrapper: icon, title and description in
 * the header, demos across the full width. Previous/next links are passed as
 * the footer, which stays hidden (PageWrapper's default) unless showFooter.
 */
export function Page({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { icon, prev, next } = useContext(PageMetaContext);
  return (
    <PageWrapper
      icon={icon}
      title={title}
      description={description}
      actions={actions}
      footerFixed
      footer={
        <>
          {prev ? (
            <Button variant="ghost" size="sm" asChild className="min-w-0">
              <a href={prev.href}>
                <ArrowLeftIcon />
                <span className="truncate">{prev.label}</span>
              </a>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button variant="ghost" size="sm" asChild className="min-w-0">
              <a href={next.href}>
                <span className="truncate">{next.label}</span>
                <ArrowRightIcon />
              </a>
            </Button>
          ) : null}
        </>
      }
    >
      <div className="grid gap-8 pt-2 md:gap-10">{children}</div>
    </PageWrapper>
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
        <div className={cn("flex flex-wrap items-center gap-3 p-4 md:p-6", className)}>{children}</div>
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
