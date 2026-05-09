"use client";

import { useMemo, useState } from "react";
import { LOCATION_OPTIONS } from "@/lib/locations";

type EventType = "move_in" | "move_out";
type Status = "idle" | "submitting" | "success" | "error";

export function DemoForm() {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationSlug, setLocationSlug] = useState(LOCATION_OPTIONS[0].slug);
  const [eventType, setEventType] = useState<EventType>("move_in");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const phoneDigits = phone.replace(/\D/g, "");
  const canSubmit =
    firstName.trim().length > 0 &&
    phoneDigits.length === 10 &&
    !!locationSlug &&
    status !== "submitting";

  const formattedPhone = useMemo(() => formatPhone(phone), [phone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: `+1${phoneDigits}`,
          locationSlug,
          eventType,
          customerName: firstName.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong. Try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl">
          📱
        </div>
        <h3 className="mb-2 text-2xl font-semibold tracking-tight">
          Check your phone!
        </h3>
        <p className="text-gray-600">
          We just texted {firstName} at {formattedPhone}. Reply to chat with the
          agent.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setFirstName("");
            setPhone("");
          }}
          className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-3.5">
        <Field label="Name">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="George"
            autoComplete="given-name"
            className="w-full rounded-full border border-gray-200 bg-white px-5 py-2.5 text-base placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </Field>

        <Field label="Phone Number">
          <div className="flex items-stretch overflow-hidden rounded-full border border-gray-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-base font-medium text-gray-600">
              +1
            </span>
            <input
              type="tel"
              value={formattedPhone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="234-567-8910"
              autoComplete="tel-national"
              inputMode="tel"
              className="w-full bg-transparent px-5 py-2.5 text-base placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </Field>

        <Field label="Location">
          <div className="relative">
            <select
              value={locationSlug}
              onChange={(e) => setLocationSlug(e.target.value)}
              className="w-full appearance-none rounded-full border border-gray-200 bg-white px-5 py-2.5 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc.slug} value={loc.slug}>
                  {loc.name}
                </option>
              ))}
            </select>
            <svg
              aria-hidden
              className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0l-4.25-4.4a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </Field>

        <Field label="Service Type">
          <div className="grid grid-cols-2 gap-2 rounded-full bg-gray-100 p-1">
            <ToggleOption
              active={eventType === "move_in"}
              onClick={() => setEventType("move_in")}
              label="Move-in"
            />
            <ToggleOption
              active={eventType === "move_out"}
              onClick={() => setEventType("move_out")}
              label="Move-out"
            />
          </div>
        </Field>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 w-full rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
        >
          {status === "submitting" ? "Sending…" : "Send me a text"}
        </button>

        {status === "error" && (
          <p className="text-center text-sm text-red-600">{errorMsg}</p>
        )}

        <p className="text-center text-xs text-gray-400">
          By submitting, you agree to receive a demo SMS at the number above.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleOption({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
