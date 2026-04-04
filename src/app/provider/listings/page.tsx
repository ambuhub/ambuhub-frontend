export default function ProviderListingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        My listings
      </h1>
      <p className="mt-2 text-foreground/70">
        Services and equipment you have published. Editing and status controls
        will appear here.
      </p>
      <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-white px-6 py-16 text-center text-foreground/55">
        No listings yet. Use{" "}
        <span className="font-medium text-ambuhub-brand">Add service</span> to
        create one.
      </div>
    </div>
  );
}
