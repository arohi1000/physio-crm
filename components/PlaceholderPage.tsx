type PlaceholderPageProps = {
  title: string;
  milestone: string;
  summary: string;
  plannedWork: readonly string[];
};

/**
 * Every route in `physio-crm-PLAN.md` §2 exists from Milestone 0 so the
 * information architecture is visible and navigable. Each one states what will
 * live there and which milestone builds it; the milestone that builds a screen
 * deletes its placeholder.
 */
export function PlaceholderPage({ title, milestone, summary, plannedWork }: PlaceholderPageProps) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sage text-xs font-semibold tracking-widest uppercase">
          Not built yet &middot; {milestone}
        </p>
        <h1 className="text-ink text-2xl font-semibold">{title}</h1>
        <p className="text-ink-soft text-sm">{summary}</p>
      </header>

      <section className="border-line bg-paper-raised rounded-lg border p-5">
        <h2 className="text-ink text-sm font-semibold">What will live here</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {plannedWork.map((item) => (
            <li key={item} className="border-line text-ink-soft border-l-2 pl-3 text-sm">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
