import { site } from "@/lib/site";
import { btn, cx } from "@/lib/ui";
import { PhoneIcon } from "./ui/icons";
import { Logo } from "./ui/Logo";

export function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-2.5 md:px-10 lg:px-[72px]">
        <a href="#top" aria-label={`${site.name} — back to top`} className="flex min-h-11 shrink-0 items-center">
          <Logo priority className="h-10 md:h-12" />
        </a>
        <div className="flex items-center gap-2">
          <a href="#stock" className={cx(btn.base, btn.ghost, btn.md)}>Stock</a>
          <a href={site.phoneHref} aria-label={`Call ${site.name}`} className={cx(btn.base, btn.secondary, btn.md)}>
            <PhoneIcon size={18} />
            <span className="whitespace-nowrap">Call<span className="hidden md:inline"> {site.phone}</span></span>
          </a>
        </div>
      </div>
    </nav>
  );
}
