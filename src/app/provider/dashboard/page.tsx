import { Bell, Search, Upload, Wallet } from "lucide-react";

const metricCards = [
  {
    label: "Active listings",
    value: "18",
    delta: "+3 this week",
    cardClass:
      "border-blue-500/40 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white shadow-lg shadow-blue-900/40",
  },
  {
    label: "Open bookings",
    value: "7",
    delta: "+2 this week",
    cardClass:
      "border-sky-500/40 bg-gradient-to-br from-sky-900 via-blue-800 to-sky-700 text-white shadow-lg shadow-sky-900/40",
  },
  {
    label: "Unread messages",
    value: "12",
    delta: "4 urgent",
    cardClass:
      "border-indigo-500/40 bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-700 text-white shadow-lg shadow-indigo-900/40",
  },
] as const;

export default function ProviderDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[26px] border border-blue-100/80 bg-white/95 p-5 shadow-xl shadow-slate-200/70 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your provider performance, listings, and activity from one
              place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-300/50 transition hover:opacity-95"
            >
              <Upload className="h-4 w-4" />
              Upload listing
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,0.95fr)]">
          <div className="rounded-2xl border border-blue-800/60 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-3 shadow-xl shadow-blue-950/55 ring-1 ring-white/10 sm:p-4">
            <label htmlFor="dashboard-search" className="sr-only">
              Search dashboard
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                id="dashboard-search"
                type="text"
                placeholder="Search listings, messages, bookings..."
                className="w-full rounded-xl border border-slate-200/90 bg-white px-9 py-2.5 text-sm text-slate-800 shadow-md shadow-slate-900/25 outline-none ring-1 ring-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/45"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-900 via-blue-800 to-cyan-700 p-4 text-white shadow-lg shadow-cyan-900/40">
            <p className="text-xs uppercase tracking-wide text-cyan-100/85">
              Wallet balance
            </p>
            <p className="mt-2 flex items-center gap-2 text-xl font-bold text-white">
              <Wallet className="h-5 w-5 text-cyan-200" />
              ₦1,250,000
            </p>
            <p className="mt-1 text-sm text-cyan-100/85">Available balance</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metricCards.map((card) => (
            <article
              key={card.label}
              className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-xl ${card.cardClass}`}
            >
              <p className="text-sm font-medium text-white/85">{card.label}</p>
              <p className="mt-1 text-3xl font-bold text-white">{card.value}</p>
              <p className="mt-1 text-xs font-medium text-cyan-100">{card.delta}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Monthly performance
              </h2>
              <span className="text-xs text-slate-500">Jan - Aug</span>
            </div>
            <div className="mt-5 h-44 rounded-xl bg-gradient-to-b from-cyan-50 via-white to-white p-4">
              <div className="flex h-full items-end gap-2">
                {[35, 56, 44, 67, 40, 59, 74, 62].map((height, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Recent activities
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="rounded-lg bg-slate-50 px-3 py-2">
                New listing published in Ambulance equipment.
              </li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">
                Booking request received for event standby.
              </li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">
                Listing price updated for oxygen concentrator package.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
