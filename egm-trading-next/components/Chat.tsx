"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { type Car, carMeta } from "@/lib/cars";
import { btn, cx } from "@/lib/ui";
import { ChatIcon, SendIcon, XIcon } from "./ui/icons";

type Mode = "buy" | "sell";
type Step = "intent" | "sellcar" | "name" | "phone" | "time" | "ask" | null;
type Msg = { from: "bot" | "user"; text: string };
type Lead = { name?: string; phone?: string; time?: string; vehicle?: string };
type OpenOpts = { car?: Car | null; mode?: Mode; ask?: boolean };

const ChatCtx = createContext<{ open: (o?: OpenOpts) => void }>({ open: () => {} });
export const useChat = () => useContext(ChatCtx);

/** Any button that opens the assistant (works inside server components). */
export function ChatButton({ children, className, ...opts }: OpenOpts & { children: ReactNode; className?: string }) {
  const { open } = useChat();
  return (
    <button type="button" className={className} onClick={() => open(opts)}>
      {children}
    </button>
  );
}

const UK_PHONE = /^(\+44|0)\d{9,10}$/;
const WHEN: Record<string, string> = { morning: "in the morning", afternoon: "in the afternoon", evening: "in the evening" };

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [car, setCar] = useState<Car | null>(null);
  const [mode, setMode] = useState<Mode>("buy");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [step, setStep] = useState<Step>(null);
  const [lead, setLead] = useState<Lead>({});
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, typing]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const bot = useCallback((texts: string | string[], next?: Step) => {
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, ...[texts].flat().map((text) => ({ from: "bot" as const, text }))]);
      if (next !== undefined) setStep(next);
    }, 650);
  }, []);

  const open = useCallback(
    ({ car = null, mode = "buy", ask = false }: OpenOpts = {}) => {
      setOpen(true);
      setCar(car);
      setMode(mode);
      setMsgs([]);
      setLead({});
      setDraft("");
      setStep(null);
      if (car && ask) bot(`Ask me anything about the ${car.year} ${car.name}.`, "ask");
      else if (car) bot([`The ${car.year} ${car.name} at ${car.price} — good choice.`, "Leave your details and one of the team will call you back.", "What's your first name?"], "name");
      else if (mode === "sell") bot(["We buy most pre-owned cars across London.", "What are you selling? A reg or make and model is fine."], "sellcar");
      else bot("Hi, I'm the EGM Trading assistant. How can I help?", "intent");
    },
    [bot]
  );

  const ask = async (question: string, booked: boolean) => {
    setTyping(true);
    let reply = "";
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, carId: car?.id, booked }),
      });
      reply = (await r.json()).reply;
    } catch {}
    if (!reply) reply = booked ? "Good question — I've noted it for the team so they can answer on your call." : "Good question — the team can answer that properly. Want me to book you a callback?";
    setTyping(false);
    setMsgs((m) => [...m, { from: "bot", text: reply }]);
    setStep("ask");
  };

  const submit = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setDraft("");
    const next = { ...lead };

    if (/^request a callback$/i.test(text) && !next.phone) return bot("Sure. What's your first name?", "name");

    switch (step) {
      case "intent":
        if (/sell/i.test(text)) {
          setMode("sell");
          return bot("What are you selling? A reg or make and model is fine.", "sellcar");
        }
        if (/question/i.test(text)) return bot("Ask away — anything about our stock or how buying works.", "ask");
        return bot("What's your first name?", "name");
      case "sellcar":
        setLead({ ...next, vehicle: text });
        return bot(["Got it.", "What's your first name?"], "name");
      case "name": {
        const name = text.split(/\s+/)[0];
        setLead({ ...next, name });
        return bot(`Thanks, ${name}. What's the best number to reach you on?`, "phone");
      }
      case "phone":
        if (!UK_PHONE.test(text.replace(/[\s()-]/g, ""))) return bot("That doesn't look like a UK number — could you check it?", "phone");
        setLead({ ...next, phone: text });
        return bot("When's best for a call?", "time");
      case "time": {
        const booked = { ...next, time: text };
        setLead(booked);
        const when = WHEN[text.toLowerCase()] ?? (/soon|asap|now/i.test(text) ? "as soon as we can" : text);
        const about = car ? ` about the ${car.name}` : mode === "sell" && booked.vehicle ? ` with an offer for your ${booked.vehicle}` : "";
        fetch("/api/callback", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...booked, mode, carId: car?.id ?? null }),
        }).catch(() => {});
        return bot([`You're booked in. ${booked.name}, we'll call ${booked.phone} ${when}${about}.`, "Anything you want to know in the meantime?"], "ask");
      }
      default:
        ask(text, !!next.phone);
    }
  };

  let chips: string[] = [];
  if (!typing) {
    if (step === "intent") chips = ["Request a callback", "Sell my car", "Ask a question"];
    else if (step === "time") chips = ["Morning", "Afternoon", "Evening", "As soon as possible"];
    else if (step === "ask" && !lead.phone) chips = ["Request a callback"];
  }
  const placeholder = ({ name: "First name", phone: "Mobile number", sellcar: "e.g. 2018 Ford Focus", time: "Or type a time" } as Record<string, string>)[step ?? ""] ?? "Type a message";

  return (
    <ChatCtx.Provider value={{ open }}>
      {children}

      {!isOpen && (
        <button
          type="button"
          onClick={() => open()}
          aria-label="Chat with us"
          className={cx(btn.base, btn.primary, "fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-4 z-40 min-h-14 gap-2.5 px-5 text-base shadow-lg md:bottom-6 md:right-6")}
        >
          <ChatIcon size={22} />
          Chat
        </button>
      )}

      {isOpen && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-45 bg-steel-900/35" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="EGM Trading assistant"
            className="fixed bottom-0 right-0 z-50 flex h-[min(88svh,640px)] w-full flex-col border border-line bg-paper shadow-lg sm:bottom-5 sm:right-5 sm:w-[400px]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line py-3 pl-4 pr-3">
              <div className="flex flex-col">
                <span className="font-heading text-xl font-semibold uppercase tracking-[0.02em]">EGM Assistant</span>
                <span className="text-xs text-ink/70">Callbacks usually same day</span>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className={cx(btn.base, btn.ghost, "size-11 p-0 text-ink")}>
                <XIcon size={22} />
              </button>
            </div>

            {car && (
              <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={car.images[0]} alt="" className="h-12 w-16 border border-line object-cover" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-semibold">{car.year} {car.name}</span>
                  <span className="text-[13px] text-ink/70">{carMeta(car)}</span>
                </div>
                <span className="font-heading text-xl font-semibold">{car.price}</span>
              </div>
            )}

            <div ref={listRef} className="flex flex-1 flex-col gap-2 overflow-y-auto overscroll-contain p-4" aria-live="polite">
              {msgs.map((m, i) =>
                m.from === "bot" ? (
                  <div key={i} className="max-w-[85%] self-start border border-line bg-surface px-3 py-2.5 text-[15px] leading-[1.45]">{m.text}</div>
                ) : (
                  <div key={i} className="max-w-[85%] self-end bg-steel-700 px-3 py-2.5 text-[15px] leading-[1.45] text-paper">{m.text}</div>
                )
              )}
              {typing && <div className="self-start border border-line px-3 py-2.5 text-sm text-ink/60">Typing…</div>}
            </div>

            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {chips.map((c) => (
                  <button key={c} type="button" onClick={() => submit(c)} className={cx(btn.base, btn.md, "border-steel-400 text-steel-700 hover:bg-steel/10 active:bg-steel/18")}>
                    {c}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(draft);
                inputRef.current?.focus();
              }}
              className="flex gap-2 border-t border-line p-3 pb-[calc(12px+env(safe-area-inset-bottom))]"
            >
              {/* 16px text stops iOS zooming on focus */}
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                type={step === "phone" ? "tel" : "text"}
                inputMode={step === "phone" ? "tel" : "text"}
                autoComplete={step === "phone" ? "tel" : step === "name" ? "given-name" : "off"}
                placeholder={placeholder}
                aria-label="Message"
                className="min-h-12 flex-1 border border-line bg-surface px-2.5 text-base text-ink caret-steel hover:border-ink/45 focus-visible:border-steel focus-visible:outline-offset-0"
              />
              <button type="submit" aria-label="Send" className={cx(btn.base, btn.primary, "size-12 flex-none p-0")}>
                <SendIcon />
              </button>
            </form>
          </div>
        </>
      )}
    </ChatCtx.Provider>
  );
}
