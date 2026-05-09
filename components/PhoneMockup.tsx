"use client";

import { useEffect, useState } from "react";

type Bubble =
  | { kind: "agent"; text: string }
  | { kind: "customer"; text: string }
  | { kind: "link"; text: string };

const SCRIPT: Bubble[] = [
  {
    kind: "agent",
    text: "Hi George! Thanks for choosing CubeSmart Astoria. How was your move-in? Rate 1–10 🙏",
  },
  {
    kind: "customer",
    text: "8! The staff was super helpful",
  },
  {
    kind: "agent",
    text: "So glad to hear that! Mind sharing on Google? Here's the link 👇",
  },
  { kind: "link", text: "⭐ Leave a Google Review" },
];

const STEP_MS = 1100;
const TYPING_MS = 550;

export function PhoneMockup() {
  const [step, setStep] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        for (let i = 0; i < SCRIPT.length; i++) {
          const bubble = SCRIPT[i];
          if (cancelled) return;

          if (bubble.kind === "agent" || bubble.kind === "link") {
            setShowTyping(true);
            await sleep(TYPING_MS);
            if (cancelled) return;
            setShowTyping(false);
          }

          setStep(i + 1);
          await sleep(STEP_MS);
        }

        await sleep(1400);
        if (cancelled) return;
        setStep(0);
        await sleep(400);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = SCRIPT.slice(0, step);

  return (
    <div className="relative mx-auto w-[300px] sm:w-[340px]">
      {/* viewport — shorter than full phone, mask fades the bottom out */}
      <div
        className="relative h-[440px] overflow-hidden sm:h-[480px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        }}
      >
        {/* phone frame — full aspect, overflows the viewport */}
        <div className="relative aspect-[9/19]">
          {/* outer titanium frame */}
          <div className="absolute inset-0 rounded-[44px] bg-gradient-to-b from-neutral-700 via-neutral-900 to-neutral-800 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset]" />
          {/* inner bezel */}
          <div className="absolute inset-[3px] rounded-[42px] bg-black" />
          {/* side buttons */}
          <div className="absolute -left-[2px] top-[18%] h-9 w-[3px] rounded-l bg-neutral-700" />
          <div className="absolute -left-[2px] top-[27%] h-14 w-[3px] rounded-l bg-neutral-700" />
          <div className="absolute -left-[2px] top-[36%] h-14 w-[3px] rounded-l bg-neutral-700" />
          <div className="absolute -right-[2px] top-[24%] h-20 w-[3px] rounded-r bg-neutral-700" />

          {/* screen */}
          <div className="absolute inset-[7px] overflow-hidden rounded-[36px] bg-white">
            {/* dynamic island */}
            <div className="absolute left-1/2 top-2 z-10 h-[26px] w-[100px] -translate-x-1/2 rounded-full bg-black" />

            {/* status bar — sits around the dynamic island */}
            <div className="relative flex h-10 items-center justify-between px-5 text-[10px] font-semibold text-gray-900">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 16 12" className="h-2.5 w-3" fill="currentColor" aria-hidden>
                  <rect x="0" y="8" width="3" height="4" rx="0.5" />
                  <rect x="4" y="6" width="3" height="6" rx="0.5" />
                  <rect x="8" y="3" width="3" height="9" rx="0.5" />
                  <rect x="12" y="0" width="3" height="12" rx="0.5" />
                </svg>
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
                  <path d="M12 3a9 9 0 0 0-6.36 2.64l1.42 1.42A7 7 0 0 1 12 5a7 7 0 0 1 4.94 2.05l1.42-1.42A9 9 0 0 0 12 3zm0 4a5 5 0 0 0-3.54 1.46l1.42 1.42A3 3 0 0 1 12 9a3 3 0 0 1 2.12.88l1.42-1.42A5 5 0 0 0 12 7zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
                <span className="ml-0.5 inline-block h-2.5 w-5 rounded-[3px] border border-gray-900 px-[1px]">
                  <span className="block h-full w-full rounded-[1px] bg-gray-900" />
                </span>
              </span>
            </div>

            {/* contact header */}
            <div className="flex flex-col items-center px-4 pb-3 pt-1">
              <div className="mb-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 text-base font-semibold text-white">
                C
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-900">
                CubeSmart
                <svg
                  viewBox="0 0 20 20"
                  className="h-3 w-3 text-gray-400"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.06 10 7.23 6.29a.75.75 0 011.04-1.08l4.4 4.25a.75.75 0 010 1.08l-4.4 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* messages */}
            <div className="flex flex-col gap-3 px-3 py-3">
              {visible.map((b, idx) => (
                <Bubble key={idx} bubble={b} />
              ))}

              {showTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ bubble }: { bubble: Bubble }) {
  if (bubble.kind === "customer") {
    return (
      <div className="flex justify-end animate-[slideInRight_300ms_ease-out]">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#1f8aff] px-3.5 py-2 text-left text-[12px] leading-snug text-white shadow-sm">
          {bubble.text}
        </div>
      </div>
    );
  }
  if (bubble.kind === "agent") {
    return (
      <div className="flex justify-start animate-[slideInLeft_300ms_ease-out]">
        <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-gray-100 px-3.5 py-2 text-left text-[12px] leading-snug text-gray-900 shadow-sm">
          {bubble.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start animate-[slideInLeft_300ms_ease-out]">
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3 py-2 text-left text-[12px] font-medium leading-snug text-blue-600 shadow-sm">
        {bubble.text}
        <div className="mt-0.5 text-[9px] font-normal text-gray-400">
          search.google.com
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}