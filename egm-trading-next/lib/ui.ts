// Shared class recipes for the Industry design system — square corners, hairlines, one solid accent.
export const container = "mx-auto w-full max-w-[1200px] px-5 md:px-10 lg:px-[72px]";

export const btn = {
  base: "inline-flex items-center justify-center gap-2 border font-medium no-underline transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45",
  primary: "border-steel bg-steel text-paper hover:bg-steel-600 hover:text-paper active:bg-steel-700",
  secondary: "border-line text-ink hover:bg-ink/7 hover:text-ink active:bg-ink/14",
  ghost: "border-transparent text-steel-700 hover:bg-steel/10 active:bg-steel/18",
  md: "min-h-11 px-4 text-[15px]",
  lg: "min-h-[52px] px-6 text-base",
};

export const kicker = "block text-[13px] font-semibold uppercase tracking-[0.08em] text-steel-700";

// Washes a photo in the steel accent, like a screen print.
export const duotone =
  "relative overflow-hidden after:pointer-events-none after:absolute after:inset-0 after:bg-steel after:mix-blend-color after:content-['']";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
