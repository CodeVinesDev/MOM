import Link from "next/link";

const features = [
  {
    title: "AI-generated meeting notes",
    description:
      "Extract polished MOM summaries, decisions, and action items automatically from your transcript.",
  },
  {
    title: "Auto email distribution",
    description:
      "Send elegant meeting summaries to all participants with one click and track delivery status.",
  },
  {
    title: "Task assignment & reminders",
    description:
      "Turn decisions into ownership-ready action items with due dates and status tracking.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
          <span className="inline-flex rounded-full bg-slate-950 px-4 py-1 text-sm font-semibold text-white">
            AI-powered meeting workflows
          </span>
          <div className="mt-8 space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Build better MOMs, assign tasks, and auto-mail participants.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Upload a transcript or paste meeting notes, then generate a
              polished, shareable minutes of meeting report in seconds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[2rem] bg-slate-950 p-10 text-white shadow-xl">
            <h2 className="text-3xl font-semibold">
              Organize every meeting at scale
            </h2>
            <p className="mt-4 text-slate-300 leading-8">
              Capture conversation context, extract action items automatically,
              assign responsibility, and email everyone with a beautiful
              summary.
            </p>
            <div className="mt-8 grid gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-8 shadow-xl">
              <h3 className="text-xl font-semibold">Fast workflow</h3>
              <ol className="mt-4 space-y-4 text-slate-600">
                <li>1. Login and upload a transcript</li>
                <li>2. Generate MOM and assign action items</li>
                <li>3. Send auto-email to participants</li>
              </ol>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold">Ready for teams</h3>
              <p className="mt-4 text-slate-600">
                Built for modern SaaS teams, with responsive views, analytics,
                and secure access controls.
              </p>
              <div className="mt-6 grid gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white text-center"
                >
                  Explore dashboard
                </Link>
                <Link
                  href="/meetings"
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-950 text-center hover:bg-slate-50"
                >
                  View meetings
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
