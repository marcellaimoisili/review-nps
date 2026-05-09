import { DemoForm } from "@/components/DemoForm";
import { PhoneMockup } from "@/components/PhoneMockup";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10">
        <div className="text-lg font-semibold tracking-tight">
          NPS Agent<span className="text-blue-600">.</span>
        </div>
        <div className="hidden rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 sm:inline-block"
        >
          Live Service
        </div>
      </nav>

      {/* Hero — phone + copy stacked + centered on the left, form on the right */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-2">
        <div className="flex flex-col items-center text-center">
          <PhoneMockup />

          <h1 className="mt-8 max-w-md text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Get every happy customer to leave a{" "}
            <span className="text-blue-600">Google review.</span>
          </h1>
        </div>

        <div>
          <div className="mb-5 text-center lg:text-left">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-600">
              Try it now
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              See it in action.
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              An AI agent that texts your customers, captures feedback, and
              routes happy ones straight to your Google review page.
            </p>
          </div>
          <DemoForm />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-gray-100 bg-gray-50/60 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <div className="mb-3 text-sm font-medium uppercase tracking-wider text-blue-600">
              How it works
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Step
              num="1"
              title="PMS fires an event"
              body="When a customer moves in or out, your property management system tells the agent in real time."
            />
            <Step
              num="2"
              title="Agent texts them"
              body="A friendly SMS goes out within seconds. Claude handles the conversation and gauges sentiment."
            />
            <Step
              num="3"
              title="Routed automatically"
              body="Happy customers get a one-tap Google review link. Unhappy ones get heard — and you get the feedback."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <p className="text-sm text-gray-500">
            Built by Marcella Imoisili for Uniti take-home.
          </p>
          <p className="text-xs text-gray-400">
            A product prototype demonstrating AI-powered NPS review collection for
            storage operators.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Step({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
        {num}
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{body}</p>
    </div>
  );
}
