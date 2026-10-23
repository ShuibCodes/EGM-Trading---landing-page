import { site } from "@/lib/site";
import { btn, container, cx, kicker } from "@/lib/ui";
import { ChatButton } from "./Chat";
import { Blueprint } from "./ui/Blueprint";
import { PhoneIcon } from "./ui/icons";

const steps = [
  { n: "01", title: "Tell us the car", body: "Reg or make and model is enough." },
  { n: "02", title: "We call with an offer", body: "A real number from a real person." },
  { n: "03", title: "Agree and get paid", body: "Part-exchange against our stock if you like." },
];

export function Sell() {
  return (
    <section id="sell" className={`${container} scroll-mt-16 pb-16 pt-6 md:pb-24`}>
      <span className={kicker}>02 · We buy cars</span>
      <div className="mb-4 mt-3 h-px bg-line" />
      <h2 className="text-[clamp(32px,7vw,48px)] uppercase leading-none">Selling? Get an offer.</h2>
      <Blueprint className="mt-7 grid grid-cols-1 md:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="flex items-baseline gap-3.5 border-b border-line p-5 md:border-b-0 md:border-r">
            <span className="text-[13px] font-semibold tracking-[0.08em] text-steel-700">{s.n}</span>
            <div>
              <div className="font-heading text-[22px] font-semibold uppercase">{s.title}</div>
              <div className="mt-1 text-[15px] leading-normal text-ink/78">{s.body}</div>
            </div>
          </div>
        ))}
        <div className="flex flex-col justify-center gap-2 p-5">
          <a
            href={site.phoneHref}
            aria-label={`Send an enquiry about selling your car — call ${site.phone}`}
            className={cx(btn.base, btn.primary, "min-h-[50px] w-full text-base")}
          >
            <PhoneIcon size={18} />
            Send an enquiry
          </a>
          <ChatButton
            mode="sell"
            label="Request a callback about selling your car"
            className={cx(btn.base, btn.secondary, "min-h-[50px] w-full text-base")}
          >
            Request a callback
          </ChatButton>
        </div>
      </Blueprint>
    </section>
  );
}
