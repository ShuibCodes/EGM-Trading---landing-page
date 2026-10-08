import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/ui";

const mark =
  "pointer-events-none absolute size-[11px] text-ink/55 before:absolute before:left-[5px] before:top-0 before:h-full before:w-px before:bg-current before:content-[''] after:absolute after:left-0 after:top-[5px] after:h-px after:w-full after:bg-current after:content-['']";

/** The four "+" registration marks every framed object wears. */
export function Corners() {
  return (
    <>
      <i aria-hidden className={cx(mark, "-left-1.5 -top-1.5")} />
      <i aria-hidden className={cx(mark, "-right-1.5 -top-1.5")} />
      <i aria-hidden className={cx(mark, "-bottom-1.5 -left-1.5")} />
      <i aria-hidden className={cx(mark, "-bottom-1.5 -right-1.5")} />
    </>
  );
}

/** Hairline-framed, square-cornered, transparent container with corner marks. */
export function Blueprint({
  as: Tag = "div",
  className,
  children,
  ...rest
}: { as?: ElementType; className?: string; children?: ReactNode } & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cx("relative border border-line", className)} {...rest}>
      {children}
      <Corners />
    </Tag>
  );
}
