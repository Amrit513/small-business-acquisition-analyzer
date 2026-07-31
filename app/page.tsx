export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Small Business Acquisition Analyzer
      </h1>
      <p className="mt-4 text-slate-600">
        The calculation engine (lib/calculations) is built and tested. UI
        components (input forms, results dashboard, scenario comparison,
        scoring breakdown) are the next build phase — see{" "}
        <code>CLAUDE.md</code> and <code>docs/ARCHITECTURE.md</code> for the
        plan.
      </p>
    </main>
  );
}
