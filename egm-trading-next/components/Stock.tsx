import { cars } from "@/lib/cars";
import { container, kicker } from "@/lib/ui";
import { CarCard } from "./CarCard";

export function Stock() {
  return (
    <section id="stock" className={`${container} scroll-mt-16 pb-14 pt-12 md:pt-20`}>
      <span className={kicker}>01 · In stock now</span>
      <div className="mb-4 mt-3 h-px bg-line" />
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[clamp(32px,7vw,48px)] uppercase leading-none">Today&apos;s cars</h2>
        <span className="text-[15px] text-ink/70">Swipe photos · tap to enquire or make an offer</span>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car, i) => (
          <CarCard key={car.id} car={car} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}
