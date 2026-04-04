export default function ProviderDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Dashboard
      </h1>
      <p className="mt-2 text-foreground/70">
        Overview of your standby, transport, personnel, and equipment activity on
        Ambuhub. Detailed metrics will appear here once bookings go live.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Active listings", value: "—", hint: "Placeholder" },
          { label: "Open bookings", value: "—", hint: "Placeholder" },
          { label: "Unread messages", value: "—", hint: "Placeholder" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-ambuhub-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-foreground/60">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-foreground/45">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-white/80 p-6">
        <h2 className="text-lg font-semibold text-foreground">Next steps</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-foreground/70">
          <li>Add a service to appear in search and category browse.</li>
          <li>Complete your business profile so organizers can trust your crew.</li>
          <li>Set availability for event dates and transport windows.</li>
        </ul>
      </div>
    </div>
  );
}
