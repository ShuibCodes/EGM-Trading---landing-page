import { site } from "@/lib/site";
import { container, cx } from "@/lib/ui";
import { Logo } from "./ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line">
      {/* extra bottom padding clears the floating chat button on mobile */}
      <div className={cx(container, "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-7 text-sm text-ink/70 md:pb-10", site.chat ? "pb-26" : "pb-10")}>
        <Logo className="h-12" />
        <span>Pre-owned cars bought &amp; sold · London</span>
        <a href={site.phoneHref}>{site.phone}</a>
      </div>
    </footer>
  );
}
