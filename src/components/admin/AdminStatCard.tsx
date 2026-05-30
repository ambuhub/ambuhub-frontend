import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  cardClass: string;
  iconClass: string;
  loading?: boolean;
  href?: string;
};

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
  cardClass,
  iconClass,
  loading = false,
  href,
}: Props) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white/85">{label}</p>
          {loading ? (
            <div className="mt-2 h-9 w-24 animate-pulse rounded-lg bg-white/20" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight text-white tabular-nums">
              {value}
            </p>
          )}
          {loading ? (
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-white/15" />
          ) : (
            <p className="mt-1 text-xs font-medium text-indigo-100/90">{detail}</p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/15 ${iconClass}`}
        >
          <Icon className="h-5 w-5 text-white" aria-hidden />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-white/40 via-white/20 to-transparent" />
    </>
  );

  const className = `relative overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-xl ${cardClass}`;

  if (href) {
    return (
      <Link href={href} className={`block ${className}`}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
