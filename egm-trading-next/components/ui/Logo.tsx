import Image from "next/image";
import { site } from "@/lib/site";
import { cx } from "@/lib/ui";

/** EGM Car Trading lockup for paper grounds (ink wordmark, steel swoosh). */
export function Logo({ priority, className }: { priority?: boolean; className?: string }) {
  return (
    <Image
      src="/assets/egm-logo-full-on-light.png"
      alt={site.name}
      width={98}
      height={48}
      priority={priority}
      draggable={false}
      className={cx("w-auto select-none", className)}
    />
  );
}
