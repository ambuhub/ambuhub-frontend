import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata(
  "Cookie Policy",
  "How AmbuHub uses cookies, pixels, local storage, and similar tracking technologies on www.ambuhub.com. Effective July 25th, 2026.",
);

type SectionProps = {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
};

function Section({ id, number, title, children }: SectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-blue-100/80 pt-10 first:border-t-0 first:pt-6 sm:pt-12"
    >
      <h2 className="flex flex-wrap items-baseline gap-3 text-xl font-bold tracking-tight text-blue-950 sm:text-2xl">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white shadow-md shadow-blue-500/20">
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-700 sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 text-base font-semibold text-blue-900 sm:text-lg">
      {children}
    </h3>
  );
}

function AmbuHubBrand({ className = "" }: { className?: string }) {
  return (
    <>
      Ambu
      <span className={`font-semibold text-red-600 ${className}`}>H</span>ub
    </>
  );
}

const tocItems = [
  { id: "introduction", label: "Introduction" },
  { id: "what-are-cookies", label: "What Are Cookies?" },
  { id: "types-of-cookies", label: "Types of Cookies We Use" },
  { id: "cookies-we-use", label: "Cookies We Use (Table)" },
  { id: "third-party", label: "Third-Party Cookies and Services" },
  { id: "strictly-necessary", label: "Strictly Necessary Cookies & Emergency Features" },
  { id: "choices", label: "Your Cookie Choices" },
  { id: "dnt", label: "Do Not Track Signals" },
  { id: "changes", label: "Changes to This Cookie Policy" },
  { id: "contact", label: "Contact Us" },
];

const cookieTableRows = [
  {
    name: "session_id",
    category: "Strictly Necessary",
    purpose:
      "Maintains your logged-in session and secures dispatch requests on the platform.",
    duration: "Session",
  },
  {
    name: "csrf_token",
    category: "Strictly Necessary",
    purpose:
      "Protects against cross-site request forgery attacks during booking and account actions.",
    duration: "Session",
  },
  {
    name: "[e.g., _ga]",
    category: "Performance / Analytics",
    purpose:
      "[INSERT ACTUAL ANALYTICS TOOL — e.g., distinguishes unique users for Google Analytics].",
    duration: "Session",
  },
  {
    name: "[e.g., pref_lang]",
    category: "Functionality",
    purpose:
      "Remembers your preferred language and display settings across visits.",
    duration: "12 months",
  },
  {
    name: "[INSERT IF APPLICABLE]",
    category: "Targeting / Advertising",
    purpose:
      "[INSERT PURPOSE, OR STATE \"NOT CURRENTLY USED\" if advertising/targeting cookies are not deployed.]",
    duration: "12 months",
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-blue-50/40 via-white to-sky-50/30">
      <Header />
      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden border-b border-blue-100/80 bg-black">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgb(0 105 180 / 0.4) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgb(2 132 199 / 0.3) 0%, transparent 40%)",
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 shadow-sm backdrop-blur sm:text-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 text-sky-400"
                aria-hidden
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <circle cx="9" cy="9" r="0.5" fill="currentColor" />
                <circle cx="14" cy="10" r="0.5" fill="currentColor" />
                <circle cx="8" cy="14" r="0.5" fill="currentColor" />
                <circle cx="15" cy="15" r="0.5" fill="currentColor" />
              </svg>
              Cookie policy
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Cookie Policy
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              How <AmbuHubBrand className="text-red-400" /> uses cookies,
              pixels, local storage, and similar technologies on the Site.
            </p>
            <div className="mt-8 grid gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur sm:grid-cols-2 sm:p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/90">
                  Website
                </p>
                <Link
                  href="https://www.ambuhub.com"
                  className="mt-1 block text-sm font-medium text-white hover:text-sky-200 hover:underline"
                >
                  www.ambuhub.com
                </Link>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/90">
                  Effective date
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  July 25th, 2026
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/90">
                  Last updated
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  July 25th, 2026
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/90">
                  Operator
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  <AmbuHubBrand className="text-red-400" />
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm shadow-blue-500/5 backdrop-blur sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-900/60">
                  Contents
                </p>
                <nav aria-label="Cookie policy sections" className="mt-3">
                  <ul className="space-y-0.5 text-sm">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`#${item.id}`}
                          className="group flex items-start gap-2 rounded-lg px-2.5 py-2 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                        >
                          <span
                            aria-hidden
                            className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/60 transition-colors group-hover:bg-blue-600"
                          />
                          <span className="leading-snug">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            <article className="min-w-0 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-500/5 sm:p-8 lg:p-10">
              <Section id="introduction" number="1" title="Introduction">
                <p>
                  This Cookie Policy explains how <AmbuHubBrand />
                  (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) uses
                  cookies and similar tracking technologies on www.ambuhub.com
                  (the &ldquo;Site&rdquo;) and related services (collectively,
                  the &ldquo;Services&rdquo;). It explains what these
                  technologies are, why we use them, and the choices available
                  to you.
                </p>
                <p>
                  This Cookie Policy should be read alongside our{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  , which explains more generally how we collect, use, and
                  protect your personal information.
                </p>
              </Section>

              <Section id="what-are-cookies" number="2" title="What Are Cookies?">
                <p>
                  Cookies are small text files placed on your device when you
                  visit a website. They are widely used to make websites
                  function properly, improve performance, and provide
                  information to website operators.
                </p>
                <p>
                  In addition to cookies, we may use similar tracking
                  technologies, including:
                </p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    <strong className="text-blue-950">Pixels/web beacons</strong>{" "}
                    — small graphic images that help us understand user
                    behavior and email engagement
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Local storage (HTML5/local storage objects)
                    </strong>{" "}
                    — used to store information directly in your browser
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Software development kits (SDKs)
                    </strong>{" "}
                    — used within mobile applications to enable similar
                    functionality to cookies
                  </li>
                </ul>
                <p>
                  For simplicity, we refer to all of these technologies
                  collectively as &ldquo;cookies&rdquo; in this Policy.
                </p>
              </Section>

              <Section
                id="types-of-cookies"
                number="3"
                title="Types of Cookies We Use"
              >
                <SubHeading>3.1 By Duration</SubHeading>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    <strong className="text-blue-950">Session cookies</strong>{" "}
                    — temporary cookies that are deleted when you close your
                    browser
                  </li>
                  <li>
                    <strong className="text-blue-950">Persistent cookies</strong>{" "}
                    — remain on your device for a set period, or until you
                    delete them, to remember your preferences across visits
                  </li>
                </ul>

                <SubHeading>3.2 By Source</SubHeading>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    <strong className="text-blue-950">First-party cookies</strong>{" "}
                    — set directly by <AmbuHubBrand />
                  </li>
                  <li>
                    <strong className="text-blue-950">Third-party cookies</strong>{" "}
                    — set by service providers and partners we work with, such
                    as analytics or payment providers
                  </li>
                </ul>

                <SubHeading>3.3 By Purpose</SubHeading>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    <strong className="text-blue-950">
                      Strictly necessary cookies
                    </strong>{" "}
                    — required for the Site and Services to function,
                    including emergency dispatch and account security
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Performance and analytics cookies
                    </strong>{" "}
                    — help us understand how visitors use the Site
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Functionality cookies
                    </strong>{" "}
                    — remember your preferences and settings
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Targeting/advertising cookies
                    </strong>{" "}
                    — used to deliver relevant content or ads, where
                    applicable
                  </li>
                </ul>
              </Section>

              <Section
                id="cookies-we-use"
                number="4"
                title="Cookies We Use"
              >
                <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-950">
                  <strong>Pre-launch audit required:</strong> The table below
                  illustrates the <em>types</em> of cookies that may be used on
                  the Site. The rows currently contain illustrative examples
                  only and must be replaced with the actual cookies deployed on
                  www.ambuhub.com — confirmed via a live cookie audit, consent
                  management platform scan, or review of each provider&rsquo;s
                  documentation — before this Policy is treated as final.
                </p>

                <div className="mt-5 overflow-hidden rounded-2xl border border-blue-100 shadow-sm shadow-blue-500/5">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                      <thead className="bg-gradient-to-r from-blue-600 to-sky-600 text-xs uppercase tracking-wider text-white">
                        <tr>
                          <th className="px-4 py-3 font-semibold">
                            Cookie Name
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Category
                          </th>
                          <th className="px-4 py-3 font-semibold">Purpose</th>
                          <th className="px-4 py-3 font-semibold">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100/70 bg-white">
                        {cookieTableRows.map((row, i) => (
                          <tr
                            key={row.name}
                            className={i % 2 === 0 ? "bg-white" : "bg-blue-50/30"}
                          >
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px] font-semibold text-blue-900">
                              {row.name}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  row.category.startsWith("Strictly")
                                    ? "bg-emerald-100 text-emerald-800"
                                    : row.category.startsWith("Performance")
                                      ? "bg-sky-100 text-sky-800"
                                      : row.category.startsWith("Functionality")
                                        ? "bg-indigo-100 text-indigo-800"
                                        : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {row.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 leading-relaxed text-slate-700">
                              {row.purpose}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700">
                              {row.duration}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="mt-5 text-sm italic text-slate-600">
                  Note: the rows above are illustrative examples only and must
                  be replaced with the actual cookies deployed on
                  www.ambuhub.com, confirmed via a live cookie audit or
                  consent management platform scan.
                </p>
              </Section>

              <Section
                id="third-party"
                number="5"
                title="Third-Party Cookies and Services"
              >
                <p>
                  We may allow certain third parties to place cookies on the
                  Site to provide services on our behalf. These may include:
                </p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    Analytics providers, such as <strong>Google Analytics</strong>
                  </li>
                  <li>
                    Payment processors, such as <strong>Stripe</strong>
                  </li>
                  <li>
                    Mapping and location services, such as{" "}
                    <strong>Google Maps</strong>, used to facilitate ambulance
                    dispatch and location accuracy
                  </li>
                  <li>
                    Customer support tools, such as <strong>Zendesk</strong>,{" "}
                    <strong>Intercom</strong>
                  </li>
                </ul>
                <p>
                  These third parties may use cookies in accordance with their
                  own privacy and cookie policies, which we encourage you to
                  review. We do not control these third-party cookies and are
                  not responsible for their content or practices.
                </p>
              </Section>

              <Section
                id="strictly-necessary"
                number="6"
                title="Strictly Necessary Cookies and Emergency Features"
              >
                <p>
                  Some cookies are essential to the safe and reliable operation
                  of <AmbuHubBrand />, including features used to process
                  ambulance dispatch requests, authenticate your session, and
                  maintain the security of your account.
                </p>
                <p className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 font-semibold text-blue-950">
                  These strictly necessary cookies <em>cannot</em> be disabled
                  through our cookie consent tool, because disabling them may
                  prevent the Site from functioning — including potentially
                  delaying or preventing a request for emergency transport.
                </p>
                <p>
                  If you have concerns about cookie use in the context of an
                  active emergency, please contact us using the details in
                  Section 10, and always contact your local emergency number
                  directly for life-threatening situations.
                </p>
              </Section>

              <Section
                id="choices"
                number="7"
                title="Your Cookie Choices"
              >
                <SubHeading>7.1 Cookie Consent Tool</SubHeading>
                <p>
                  When you first visit the Site, you will be presented with a
                  cookie consent banner allowing you to accept or reject
                  non-essential cookies. You can change your preferences at any
                  time by clicking &ldquo;Cookie Settings&rdquo; in the website
                  footer.
                </p>

                <SubHeading>7.2 Browser Controls</SubHeading>
                <p>
                  Most web browsers allow you to control cookies through their
                  settings. You can typically:
                </p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>Delete existing cookies from your device</li>
                  <li>Block cookies from being set in the future</li>
                  <li>Set your browser to notify you when a cookie is set</li>
                  <li>
                    Browse in private/incognito mode, which limits cookie
                    storage during your session
                  </li>
                </ul>
                <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-950">
                  <strong>Please note:</strong> Blocking or deleting cookies,
                  including strictly necessary cookies, may affect the
                  functionality of the Site and could limit your ability to use
                  certain features, including dispatch and account login.
                </p>

                <SubHeading>7.3 Mobile Devices and Advertising Identifiers</SubHeading>
                <p>
                  If you use our mobile application, you can manage tracking
                  preferences through your device settings, including limiting
                  ad tracking or resetting your advertising identifier.
                </p>

                <SubHeading>7.4 Opting Out of Analytics</SubHeading>
                <p>
                  You may opt out of certain third-party analytics tools
                  directly, for example via the{" "}
                  <span className="font-semibold text-slate-800">
                    Google Analytics Opt-out Browser Add-on
                  </span>
                  .
                </p>
              </Section>

              <Section id="dnt" number="8" title="Do Not Track Signals">
                <p>
                  Some browsers offer a &ldquo;Do Not Track&rdquo; (DNT)
                  setting. There is currently no industry-standard approach to
                  responding to DNT signals, and our Site does not currently
                  respond to DNT browser signals. We will update this Policy if
                  our practices change.
                </p>
              </Section>

              <Section
                id="changes"
                number="9"
                title="Changes to This Cookie Policy"
              >
                <p>
                  We may update this Cookie Policy from time to time to reflect
                  changes in the cookies and technologies we use, or for legal
                  or regulatory reasons. We will post the updated Policy on
                  this page with a revised &ldquo;Last Updated&rdquo; date.
                </p>
              </Section>

              <Section id="contact" number="10" title="Contact Us">
                <p>
                  If you have questions about this Cookie Policy or our use of
                  cookies, please contact us:
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-900/60">
                      Email
                    </p>
                    <Link
                      href="mailto:Contact@ambuhub.com"
                      className="mt-1 block text-sm font-semibold text-blue-800 hover:underline"
                    >
                      Contact@ambuhub.com
                    </Link>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-900/60">
                      Mailing address
                    </p>
                    <p className="mt-1 text-sm font-semibold text-blue-800">
                      Contact@ambuhub.com
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-900/60">
                      Phone
                    </p>
                    <p className="mt-1 text-sm font-semibold text-blue-800">
                      Contact@ambuhub.com
                    </p>
                  </div>
                </div>
              </Section>

              <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-blue-100 pt-8 sm:flex-row sm:items-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to home
                </Link>
                <p className="text-xs leading-relaxed text-slate-500">
                  &copy; {new Date().getFullYear()} <AmbuHubBrand />. All rights
                  reserved.
                </p>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
