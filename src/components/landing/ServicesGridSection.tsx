import {
  fetchLandingServiceCategories,
  orderLandingCategories,
} from "@/lib/landing-service-categories";
import { ServiceCategoryCard } from "@/components/services/ServiceCategoryCard";

export async function ServicesGridSection() {
  const rows = await fetchLandingServiceCategories();
  const categories = orderLandingCategories(rows);

  return (
    <section
      id="services"
      className="relative border-t border-blue-200/70 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 py-16 sm:py-20 lg:py-24"
      aria-labelledby="services-grid-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 20% 0%, rgb(56 189 248 / 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgb(99 102 241 / 0.22), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="services-grid-heading"
          className="text-center text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl"
        >
          Our services
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-blue-900/75 sm:text-lg">
          Medical transport, personnel, fleet servicing, and equipment—explore
          each path on one platform.
        </p>

        {categories.length === 0 ? (
          <p className="mt-10 text-center text-sm text-blue-900/60">
            Service categories could not be loaded. Check that the API is
            reachable and try again shortly.
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {categories.map((category, i) => (
              <li key={category.id} className="min-w-0">
                <ServiceCategoryCard category={category} index={i} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
