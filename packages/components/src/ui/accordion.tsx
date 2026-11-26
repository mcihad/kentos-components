import { ChevronDownIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "../lib/utils";

/*
 * Sections that open in place (Radix Accordion): FAQs, settings groups,
 * long details. type="single" keeps one open (collapsible lets it close),
 * type="multiple" any number. Arrow keys move between headers.
 *
 * Variants: "plain" divides the items with rules; "contained" puts them in
 * one card; "separated" makes each item its own card.
 *
 *   <Accordion type="single" collapsible variant="contained">
 *     <AccordionItem value="keys">
 *       <AccordionTrigger description="DSN ve ingest anahtarları">Anahtarlar</AccordionTrigger>
 *       <AccordionContent>…</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 */
function Accordion({
  className,
  variant = "plain",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & { variant?: "plain" | "contained" | "separated" }) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn(
        "group/accordion w-full",
        variant === "contained" && "card overflow-hidden",
        variant === "separated" && "grid gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group-data-[variant=plain]/accordion:border-b",
        "group-data-[variant=contained]/accordion:border-b group-data-[variant=contained]/accordion:last:border-b-0",
        "group-data-[variant=separated]/accordion:card group-data-[variant=separated]/accordion:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The header button. Takes an optional icon and a one-line description under
 * the title; extra content (a badge, a count) goes in `aside`.
 */
function AccordionTrigger({
  className,
  children,
  icon: Icon,
  description,
  aside,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  icon?: React.ComponentType<{ className?: string }>;
  description?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/trigger flex min-h-12 flex-1 items-center gap-3 py-3 text-left outline-none transition-colors duration-(--duration-fast) focus-visible:shadow-(--focus-shadow) disabled:pointer-events-none disabled:opacity-50",
          "group-data-[variant=contained]/accordion:px-(--card-p) group-data-[variant=separated]/accordion:px-(--card-p)",
          "group-data-[variant=contained]/accordion:hover:bg-(--surface-hover) group-data-[variant=separated]/accordion:hover:bg-(--surface-hover)",
          "group-data-[variant=plain]/accordion:rounded-sm group-data-[variant=plain]/accordion:hover:text-(--text-brand)",
          className,
        )}
        {...props}
      >
        {Icon ? (
          <Icon className="size-4.5 shrink-0 text-muted-foreground transition-colors duration-(--duration-fast) group-data-[state=open]/trigger:text-(--text-brand)" />
        ) : null}
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="font-medium text-sm text-strong">{children}</span>
          {description ? <span className="text-muted-foreground text-sm">{description}</span> : null}
        </span>
        {aside ? <span className="shrink-0">{aside}</span> : null}
        <ChevronDownIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--duration-base) ease-(--ease-out) group-data-[state=open]/trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-[kentos-accordion-up_var(--duration-base)_var(--ease-out)] data-[state=open]:animate-[kentos-accordion-down_var(--duration-base)_var(--ease-out)]"
      {...props}
    >
      <div
        className={cn(
          "pb-4 text-muted-foreground leading-relaxed",
          "group-data-[variant=contained]/accordion:px-(--card-p) group-data-[variant=separated]/accordion:px-(--card-p)",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
