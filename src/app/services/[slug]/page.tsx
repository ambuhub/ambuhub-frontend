import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  AMBUHUB_SERVICE_SLUGS,
  getServiceBySlug,
  isAmbuhubServiceSlug,
} from "@/lib/ambuhub-services";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return AMBUHUB_SERVICE_SLUGS.map((slug) => ({ slug }));
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isAmbuhubServiceSlug(slug)) {
    notFound();
  }
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-3xl flex-1">
          <p className="text-sm font-medium text-ambuhub-brand">Services</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {service.title}
          </h1>
          <p className="mt-4 text-lg text-foreground/70">{service.description}</p>
          <div className="mt-12 rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-surface/50 px-6 py-12 text-center">
            <p className="text-foreground/60">
              Service page placeholder. Content for this section will go here.
            </p>
          </div>
          <Link
            href="/#services"
            className="mt-10 inline-flex text-sm font-semibold text-ambuhub-brand hover:underline"
          >
            &larr; Back to services
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
