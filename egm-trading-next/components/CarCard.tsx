"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { type Car, carMeta } from "@/lib/cars";
import { site } from "@/lib/site";
import { btn, cx } from "@/lib/ui";
import { Blueprint } from "./ui/Blueprint";
import { ChevronLeft, ChevronRight, PhoneIcon } from "./ui/icons";

const arrow =
  "absolute top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center bg-paper/90 text-ink transition-opacity disabled:opacity-35";

export function CarCard({ car, priority }: { car: Car; priority?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const n = car.images.length;

  const go = (d: number) => {
    const el = track.current;
    if (!el) return;
    const i = Math.max(0, Math.min(n - 1, idx + d));
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  };

  return (
    <Blueprint as="article" className="flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex size-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label={`${car.name} photos`}
        >
          {car.images.map((src, i) => (
            <div key={src} className="relative h-full flex-[0_0_100%] snap-start snap-always">
              <Image
                src={src}
                alt={`${car.year} ${car.name}, photo ${i + 1} of ${n}`}
                fill
                sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw"
                className="select-none object-cover"
                draggable={false}
                priority={priority && i === 0}
              />
            </div>
          ))}
        </div>

        {n > 1 && (
          <>
            <span className="absolute left-2.5 top-2.5 bg-steel-900/80 px-2 py-1 text-xs font-semibold tabular-nums tracking-[0.06em] text-paper">
              {idx + 1} / {n}
            </span>
            <button type="button" onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous photo" className={cx(arrow, "left-1.5")}>
              <ChevronLeft />
            </button>
            <button type="button" onClick={() => go(1)} disabled={idx === n - 1} aria-label="Next photo" className={cx(arrow, "right-1.5")}>
              <ChevronRight />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-[5px]">
              {car.images.map((src, i) => (
                <span key={src} className={cx("h-[3px] bg-paper transition-all", i === idx ? "w-[18px]" : "w-1.5 opacity-55")} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-[18px] pb-5 pt-[18px]">
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-steel-700">{carMeta(car)}</span>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[26px] uppercase leading-[1.05]">{car.name}</h3>
          <span className="whitespace-nowrap font-heading text-[26px] font-semibold leading-none tabular-nums">{car.price}</span>
        </div>
        <span className="text-sm text-ink/70">{car.detail}</span>
        <div className="mt-auto flex flex-col gap-1.5 pt-3.5">
          <a
            href={site.phoneHref}
            aria-label={`Send an enquiry about the ${car.year} ${car.name} — call ${site.phone}`}
            className={cx(btn.base, btn.primary, "min-h-[50px] w-full text-base")}
          >
            <PhoneIcon size={18} />
            Send an enquiry
          </a>
          <a
            href={site.phoneHref}
            aria-label={`Make an offer on the ${car.year} ${car.name} — call ${site.phone}`}
            className={cx(btn.base, btn.ghost, btn.md, "w-full")}
          >
            Make an offer
          </a>
        </div>
      </div>
    </Blueprint>
  );
}
