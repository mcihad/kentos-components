import { CheckIcon, XIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";

/*
 * Steps of a multi-step flow: setup wizards, onboarding, an import. Each
 * step is complete, current, upcoming or failed. Horizontal steppers show
 * numbered circles joined by lines; on phones only the circles stay, with
 * the current step's title under them. Vertical steppers carry a
 * description and any content under the current step.
 *
 * Steps are links or buttons when given `href` or `onClick` (going back to
 * a finished step), otherwise plain text. The current step has
 * aria-current="step".
 *
 *   <Stepper current={1}>
 *     <Step title="Proje" description="Ad ve platform" />
 *     <Step title="SDK" />
 *     <Step title="İlk olay" />
 *   </Stepper>
 */

export type StepState = "complete" | "current" | "upcoming" | "error";

type StepProps = Omit<ComponentProps<"li">, "title" | "onClick"> & {
  title: ReactNode;
  description?: ReactNode;
  /** Overrides the state derived from the Stepper's `current`. */
  state?: StepState;
  /** Makes the step a link (e.g. back to a finished step). */
  href?: string;
  /** Makes the step a button. */
  onClick?: () => void;
  /** Shown under the step while it is current (vertical steppers). */
  children?: ReactNode;
  /** Set by Stepper. */
  index?: number;
  orientation?: "horizontal" | "vertical";
  last?: boolean;
};

const stateLabel: Record<StepState, string> = {
  complete: "tamamlandı",
  current: "şu anki adım",
  upcoming: "sıradaki",
  error: "hata",
};

export function Stepper({
  current = 0,
  orientation = "horizontal",
  label = "Adımlar",
  className,
  children,
  ...props
}: Omit<ComponentProps<"nav">, "children"> & {
  /** Index of the current step; earlier steps are complete. */
  current?: number;
  orientation?: "horizontal" | "vertical";
  /** Accessible name of the list. */
  label?: string;
  children: ReactNode;
}) {
  const steps = (Array.isArray(children) ? children : [children]).flat().filter(Boolean) as {
    props: StepProps;
    key?: string | null;
  }[];
  const currentStep = steps[current]?.props;
  return (
    <nav
      aria-label={label}
      data-slot="stepper"
      data-orientation={orientation}
      className={className}
      {...props}
    >
      <ol className={cn("flex", orientation === "horizontal" ? "items-start" : "flex-col")}>
        {steps.map((step, i) => {
          const derived: StepState = i < current ? "complete" : i === current ? "current" : "upcoming";
          return (
            <Step
              key={step.key ?? i}
              {...step.props}
              state={step.props.state ?? derived}
              index={i}
              orientation={orientation}
              last={i === steps.length - 1}
            />
          );
        })}
      </ol>
      {orientation === "horizontal" && currentStep ? (
        // Phones show circles only; the current title goes underneath.
        <p className="mt-3 text-center font-medium text-sm text-strong sm:hidden">
          <span className="text-muted-foreground">
            Adım {current + 1}/{steps.length}:{" "}
          </span>
          {currentStep.title}
        </p>
      ) : null}
    </nav>
  );
}

const markerTone: Record<StepState, string> = {
  complete: "border-(--brand-bg) bg-(--brand-bg) text-(--brand-fg)",
  current:
    "border-(--brand-bg) bg-(--surface-card) text-(--text-brand) shadow-[0_0_0_3px_var(--surface-brand-subtle)]",
  upcoming: "border-(--border-strong) bg-(--surface-card) text-muted-foreground",
  error: "border-(--status-danger-solid) bg-(--status-danger-solid) text-white",
};

/** One step; place inside Stepper (state, index and layout come from it). */
export function Step({
  title,
  description,
  state = "upcoming",
  href,
  onClick,
  index = 0,
  orientation = "horizontal",
  last = false,
  className,
  children,
  ...props
}: StepProps) {
  const vertical = orientation === "vertical";
  const marker = (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border-2 font-semibold text-sm tabular transition-[background-color,border-color,color,box-shadow] duration-(--duration-base)",
        markerTone[state],
      )}
    >
      {state === "complete" ? (
        <CheckIcon className="size-4" strokeWidth={3} />
      ) : state === "error" ? (
        <XIcon className="size-4" strokeWidth={3} />
      ) : (
        index + 1
      )}
    </span>
  );
  const text = (
    <span className={cn("grid min-w-0 gap-0.5", !vertical && "max-sm:sr-only")}>
      <span
        className={cn(
          "font-medium text-sm leading-snug",
          state === "upcoming" ? "text-muted-foreground" : "text-strong",
          state === "error" && "text-(--status-danger-fg)",
        )}
      >
        {title}
      </span>
      {description ? <span className="text-muted-foreground text-xs leading-snug">{description}</span> : null}
      <span className="sr-only">({stateLabel[state]})</span>
    </span>
  );
  const head = (
    <>
      {marker}
      {text}
    </>
  );
  const headClass = cn(
    "flex min-w-0 gap-3 rounded-md outline-none",
    vertical ? "items-start" : "flex-col items-center text-center sm:flex-row sm:items-center sm:text-left",
  );
  const headEl = href ? (
    <a
      href={href}
      className={cn(
        headClass,
        "focus-visible:shadow-(--focus-shadow) hover:[&>span:last-child>span:first-child]:underline",
      )}
    >
      {head}
    </a>
  ) : onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        headClass,
        "focus-visible:shadow-(--focus-shadow) hover:[&>span:last-child>span:first-child]:underline",
      )}
    >
      {head}
    </button>
  ) : (
    <div className={headClass}>{head}</div>
  );

  return (
    <li
      data-slot="step"
      data-state={state}
      aria-current={state === "current" ? "step" : undefined}
      className={cn(
        "relative flex min-w-0",
        vertical ? "flex-col pb-6 last:pb-0" : "flex-1 items-center gap-3 last:flex-none",
        className,
      )}
      {...props}
    >
      {headEl}
      {/* The connector: after each step but the last. */}
      {!last ? (
        <span
          aria-hidden
          className={cn(
            "rounded-full transition-colors duration-(--duration-base)",
            state === "complete" ? "bg-(--brand-bg)" : "bg-(--border-default)",
            vertical
              ? "absolute top-10 bottom-2 left-[calc(1rem-1px)] w-0.5"
              : "mx-1 h-0.5 min-w-4 flex-1 self-start max-sm:mt-[0.9375rem] sm:self-center",
          )}
        />
      ) : null}
      {vertical && children && state === "current" ? (
        <div className="mt-3 pl-11 text-sm">{children}</div>
      ) : null}
    </li>
  );
}
