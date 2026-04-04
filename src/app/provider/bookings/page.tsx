export default function ProviderBookingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Bookings
      </h1>
      <p className="mt-2 text-foreground/70">
        Confirmed and pending requests from organizers—events, transports, and
        staffing. Calendar sync will be added later.
      </p>
      <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-white px-6 py-16 text-center text-foreground/55">
        No bookings to show yet.
      </div>
    </div>
  );
}
