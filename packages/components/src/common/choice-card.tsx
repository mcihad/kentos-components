import type { ComponentProps, ComponentType, ReactNode } from "react";
import { useId } from "react";
import { cn } from "../lib/utils";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Switch } from "../ui/switch";

/*
 * Choices that need a sentence of explanation, drawn as cards: a plan, a
 * notification channel, a retention policy. The whole card is the label, so
 * a tap anywhere toggles it; the selected card takes the brand border and
 * tint. The real control (checkbox, radio, switch) stays inside, so keyboard,
 * forms and screen readers work as with the bare control; the description is
 * wired up with aria-describedby.
 *
 *   <RadioCardGroup value={plan} onValueChange={setPlan} columns={3}>
 *     <RadioCard value="free" title="Ücretsiz" description="5 proje, 7 gün saklama" />
 *     <RadioCard value="team" title="Ekip" description="Sınırsız proje" aside="₺490/ay" />
 *   </RadioCardGroup>
 */

type Icon = ComponentType<{ className?: string }>;

type CardText = {
  title: ReactNode;
  description?: ReactNode;
  /** A small icon tile before the text. */
  icon?: Icon;
  /** Text or a badge at the end of the title line (price, "Önerilen"). */
  aside?: ReactNode;
};

const cardClass = cn(
  "group/choice relative flex cursor-pointer items-start gap-3 rounded-lg border bg-(--surface-card) p-3.5 text-left transition-[border-color,background-color,box-shadow] duration-(--duration-fast)",
  "hover:border-(--border-strong) has-[:focus-visible]:shadow-(--focus-shadow)",
  "has-[[data-state=checked]]:border-(--border-brand) has-[[data-state=checked]]:bg-(--surface-brand-subtle)",
  "has-[[aria-invalid=true]]:border-destructive",
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:hover:border-(--border-default)",
);

function CardBody({
  title,
  description,
  icon: IconTile,
  aside,
  titleId,
  descriptionId,
}: CardText & {
  titleId: string;
  descriptionId: string;
}) {
  return (
    <>
      {IconTile ? (
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-md border bg-(--surface-muted) text-muted-foreground transition-colors duration-(--duration-fast) group-has-[[data-state=checked]]/choice:border-(--border-brand) group-has-[[data-state=checked]]/choice:text-(--text-brand) [&>svg]:size-4.5"
        >
          <IconTile />
        </span>
      ) : null}
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="flex items-baseline justify-between gap-3">
          <span id={titleId} className="font-medium text-sm text-strong">
            {title}
          </span>
          {aside ? <span className="shrink-0 text-muted-foreground text-sm">{aside}</span> : null}
        </span>
        {description ? (
          <span id={descriptionId} className="text-muted-foreground text-sm leading-snug">
            {description}
          </span>
        ) : null}
      </span>
    </>
  );
}

/** A checkbox with a title and description, as a card. Group several in a grid. */
export function CheckboxCard({
  title,
  description,
  icon,
  aside,
  className,
  id,
  ...props
}: Omit<ComponentProps<typeof Checkbox>, "title"> & CardText) {
  const auto = useId();
  const controlId = id ?? auto;
  return (
    <label htmlFor={controlId} data-slot="checkbox-card" className={cn(cardClass, className)}>
      <Checkbox
        id={controlId}
        aria-labelledby={`${controlId}-title`}
        aria-describedby={description ? `${controlId}-desc` : undefined}
        className="mt-0.5"
        {...props}
      />
      <CardBody
        title={title}
        description={description}
        icon={icon}
        aside={aside}
        titleId={`${controlId}-title`}
        descriptionId={`${controlId}-desc`}
      />
    </label>
  );
}

/** A switch with a title and description; the switch sits at the end. For settings that apply at once. */
export function SwitchCard({
  title,
  description,
  icon,
  aside,
  className,
  id,
  ...props
}: Omit<ComponentProps<typeof Switch>, "title"> & CardText) {
  const auto = useId();
  const controlId = id ?? auto;
  return (
    <label htmlFor={controlId} data-slot="switch-card" className={cn(cardClass, "items-center", className)}>
      <CardBody
        title={title}
        description={description}
        icon={icon}
        aside={aside}
        titleId={`${controlId}-title`}
        descriptionId={`${controlId}-desc`}
      />
      <Switch
        id={controlId}
        aria-labelledby={`${controlId}-title`}
        aria-describedby={description ? `${controlId}-desc` : undefined}
        {...props}
      />
    </label>
  );
}

/**
 * A radio group laid out as cards. `columns` sets the grid from the sm
 * breakpoint up; phones always stack. Arrow keys move between the cards.
 */
export function RadioCardGroup({
  columns = 1,
  className,
  ...props
}: ComponentProps<typeof RadioGroup> & { columns?: 1 | 2 | 3 | 4 }) {
  return (
    <RadioGroup
      data-slot="radio-card-group"
      className={cn(
        "grid gap-2.5",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
      {...props}
    />
  );
}

/** One card of a RadioCardGroup. */
export function RadioCard({
  title,
  description,
  icon,
  aside,
  className,
  id,
  ...props
}: Omit<ComponentProps<typeof RadioGroupItem>, "title"> & CardText) {
  const auto = useId();
  const controlId = id ?? auto;
  return (
    <label htmlFor={controlId} data-slot="radio-card" className={cn(cardClass, className)}>
      <RadioGroupItem
        id={controlId}
        aria-labelledby={`${controlId}-title`}
        aria-describedby={description ? `${controlId}-desc` : undefined}
        className="mt-0.5"
        {...props}
      />
      <CardBody
        title={title}
        description={description}
        icon={icon}
        aside={aside}
        titleId={`${controlId}-title`}
        descriptionId={`${controlId}-desc`}
      />
    </label>
  );
}
