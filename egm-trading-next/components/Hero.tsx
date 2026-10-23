import Image from "next/image";
import { site } from "@/lib/site";
import { btn, cx, duotone } from "@/lib/ui";
import { ChatButton } from "./Chat";
import { PhoneIcon } from "./ui/icons";

export function Hero() {
  return (
    <section className="relative flex min-h-[min(84svh,760px)] items-end overflow-hidden bg-steel-900">
      <div className="absolute inset-0">
        <div className={cx("size-full", duotone)}>
          <Image src="/hero.avif" alt="Black BMW coupé on an autumn road" fill priority sizes="100vw" className="object-cover object-[38%_60%]" />
        </div>
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-steel-900/95 via-steel-900/55 via-45% to-transparent to-75%" />

      <div className="relative mx-auto w-full max-w-[1200px] px-5 pb-8 text-paper md:px-10 md:pb-16 lg:px-[72px]">
        <h1 className="max-w-[12ch] text-[clamp(44px,11vw,96px)] uppercase leading-[0.98] tracking-[0.01em]">
          <span className="block">Pre-owned cars.</span>
          <span className="block">Bought &amp; sold in London.</span>
        </h1>
        <p className="mt-4 max-w-[42ch] text-[17px] leading-normal md:text-lg">
          Hand-picked stock at straight prices. See one you like? Send an enquiry or make an offer.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <a href="#stock" className={cx(btn.base, btn.primary, btn.lg, "max-w-[260px] flex-[1_1_160px]")}>View stock</a>
          <a
            href={site.phoneHref}
            aria-label={`Send an enquiry — call ${site.phone}`}
            className={cx(btn.base, btn.lg, "max-w-[260px] flex-[1_1_160px] border-paper/60 text-paper hover:bg-paper/10 hover:text-paper active:bg-paper/20")}
          >
            <PhoneIcon size={18} />
            Send an enquiry
          </a>
          <ChatButton
            label="Request a callback"
            className={cx(btn.base, btn.lg, "max-w-[260px] flex-[1_1_160px] border-paper/60 text-paper hover:bg-paper/10 hover:text-paper active:bg-paper/20")}
          >
            Request a callback
          </ChatButton>
        </div>
      </div>
    </section>
  );
}
