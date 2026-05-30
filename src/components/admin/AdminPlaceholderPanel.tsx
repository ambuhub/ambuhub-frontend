type AdminPlaceholderPanelProps = {
  title: string;
  description: string;
  features: string[];
};

export function AdminPlaceholderPanel({
  title,
  description,
  features,
}: AdminPlaceholderPanelProps) {
  return (
    <section className="rounded-2xl border border-dashed border-indigo-200/80 bg-indigo-50/30 p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-700">
          Coming soon
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
        {description}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AdminPageHeader({
  title,
  description,
  theme = "default",
}: {
  title: string;
  description: string;
  theme?: "default" | "blue";
}) {
  const isBlue = theme === "blue";

  return (
    <div
      className={
        isBlue
          ? "rounded-[26px] border border-indigo-400/30 bg-gradient-to-br from-[#004a7c] via-indigo-800 to-violet-800 p-5 shadow-xl shadow-indigo-900/30 sm:p-6"
          : "rounded-[26px] border border-indigo-100/80 bg-white/95 p-5 shadow-xl shadow-slate-200/70 backdrop-blur-sm sm:p-6"
      }
    >
      <h1
        className={
          isBlue
            ? "text-2xl font-bold tracking-tight text-white sm:text-3xl"
            : "bg-gradient-to-r from-[#004a7c] via-indigo-600 to-violet-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl"
        }
      >
        {title}
      </h1>
      <p
        className={
          isBlue
            ? "mt-2 max-w-3xl text-sm text-indigo-100 sm:text-base"
            : "mt-2 max-w-3xl text-sm text-slate-600 sm:text-base"
        }
      >
        {description}
      </p>
    </div>
  );
}

export function AdminTableSkeleton({
  columns,
  rows = 5,
}: {
  columns: string[];
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden sm:grid sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))] sm:gap-4 sm:border-b sm:border-slate-100 sm:bg-slate-50/80 sm:px-4 sm:py-3"
        style={{ ["--cols" as string]: columns.length }}
      >
        {columns.map((col) => (
          <span key={col} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {col}
          </span>
        ))}
      </div>
      <ul className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="px-4 py-4">
            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))] sm:items-center sm:gap-4"
              style={{ ["--cols" as string]: columns.length }}
            >
              {columns.map((col) => (
                <div key={col} className="space-y-1">
                  <span className="text-xs font-medium text-slate-400 sm:hidden">{col}</span>
                  <div className="h-3 w-full max-w-[10rem] animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
