"use client";

export default function ProviderAddServicePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Add service
      </h1>
      <p className="mt-2 text-foreground/70">
        List standby coverage, scheduled transport, personnel, or equipment for
        venues and organizers. Submission is not wired to the API yet.
      </p>

      <form
        className="mt-8 space-y-6 rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label
            htmlFor="service-category"
            className="block text-sm font-medium text-foreground"
          >
            Service category
          </label>
          <select
            id="service-category"
            name="category"
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            defaultValue=""
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="emergency-medical-transport">
              Emergency Medical Transport
            </option>
            <option value="non-emergency-medical-transport">
              Non Emergency Medical Transport
            </option>
            <option value="personnel">Personnel</option>
            <option value="ambulance-servicing">Ambulance Servicing</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-foreground"
          >
            Department (sub-category)
          </label>
          <input
            id="department"
            name="department"
            type="text"
            readOnly
            placeholder="Will filter by category when live"
            className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-ambuhub-200 bg-ambuhub-surface/50 px-4 py-3 text-foreground/60 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="service-title"
            className="block text-sm font-medium text-foreground"
          >
            Title
          </label>
          <input
            id="service-title"
            name="title"
            type="text"
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="e.g. Event medical standby — 2 ambulances"
          />
        </div>

        <div>
          <label
            htmlFor="service-description"
            className="block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="service-description"
            name="description"
            rows={5}
            className="mt-1.5 w-full resize-y rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="Coverage area, crew size, vehicle types, pricing notes…"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-foreground">
            Photos or documents
          </span>
          <p className="mt-1 text-xs text-foreground/55">
            Upload will connect to storage after backend endpoints are ready.
          </p>
          <input
            type="file"
            accept="image/*,.pdf"
            multiple
            className="mt-3 block w-full text-sm text-foreground/70 file:mr-4 file:rounded-lg file:border-0 file:bg-ambuhub-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ambuhub-brand-dark"
          />
        </div>

        <div className="rounded-lg bg-ambuhub-50 px-4 py-3 text-sm text-ambuhub-900">
          This form is a UI placeholder only. No data is saved yet.
        </div>

        <button
          type="submit"
          disabled
          className="w-full rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white opacity-60"
        >
          Publish service (coming soon)
        </button>
      </form>
    </div>
  );
}
