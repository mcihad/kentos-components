import * as React from "react"
import { attachSwipeDismiss } from "../lib/swipe-dismiss"
import { cn } from "../lib/utils"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        // Fades on the same curve and duration as the panel, so the dimming
        // and the slide read as one movement.
        "fixed inset-0 z-50 bg-(--surface-overlay) will-change-[opacity] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=open]:duration-(--duration-sheet) data-[state=open]:ease-(--ease-sheet) data-[state=closed]:duration-[calc(var(--duration-sheet)*0.65)] data-[state=closed]:ease-(--ease-out)",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  swipeToClose = true,
  ref,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  /** Side sheets close with a swipe towards their edge on touch screens. */
  swipeToClose?: boolean
}) {
  const overlay = React.useRef<HTMLDivElement | null>(null)
  const closer = React.useRef<HTMLButtonElement | null>(null)
  const stopSwipe = React.useRef<(() => void) | null>(null)
  const swipeSide = swipeToClose && (side === "left" || side === "right") ? side : null

  const setPanel = React.useCallback(
    (el: HTMLDivElement | null) => {
      stopSwipe.current?.()
      stopSwipe.current = null
      if (typeof ref === "function") ref(el)
      else if (ref) ref.current = el
      if (el && swipeSide)
        stopSwipe.current = attachSwipeDismiss(el, {
          side: swipeSide,
          overlay: () => overlay.current,
          onDismiss: () => closer.current?.click(),
        })
    },
    [ref, swipeSide]
  )

  return (
    <SheetPortal>
      <SheetOverlay ref={overlay} />
      <SheetPrimitive.Content
        ref={setPanel}
        data-slot="sheet-content"
        className={cn(
          // Opens with the long decelerating glide of native sheets (fast
          // start, soft landing) and closes quicker. Only transform animates,
          // on its own compositor layer, so heavy content does not stutter.
          "fixed z-50 flex flex-col gap-4 bg-card shadow-(--shadow-xl) will-change-transform [backface-visibility:hidden] data-[state=closed]:animate-out data-[state=open]:animate-in",
          "data-[state=open]:duration-(--duration-sheet) data-[state=open]:ease-(--ease-sheet) data-[state=closed]:duration-[calc(var(--duration-sheet)*0.65)] data-[state=closed]:ease-(--ease-out)",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 touch-pan-y border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 touch-pan-y border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className
        )}
        {...props}
      >
        {children}
        {swipeSide ? (
          <SheetPrimitive.Close ref={closer} tabIndex={-1} aria-hidden className="hidden" />
        ) : null}
        {showCloseButton && (
          <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary">
            <XIcon className="size-4" />
            <span className="sr-only">Kapat</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
