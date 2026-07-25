import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata(
  "Privacy Policy",
  "How AmbuHub collects, uses, discloses, and safeguards your personal and health information when you use www.ambuhub.com and related services. Effective July 25th, 2026.",
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

const introTocItems = [
  { id: "introduction", label: "Introduction" },
  { id: "scope", label: "Scope of This Policy" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "legal-basis", label: "Legal Basis for Processing (EEA/UK)" },
  { id: "how-we-share", label: "How We Share Your Information" },
  { id: "hipaa", label: "Health Information and HIPAA" },
  { id: "payments", label: "Payment Information" },
  { id: "cookies", label: "Cookies and Tracking Technologies" },
  { id: "retention", label: "Data Retention" },
  { id: "security", label: "Data Security" },
  { id: "rights", label: "Your Privacy Rights" },
  { id: "children", label: "Children's Privacy" },
  { id: "international", label: "International Data Transfers" },
  { id: "third-party", label: "Third-Party Links" },
  { id: "changes", label: "Changes to This Privacy Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              Trust &amp; privacy
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              How AmbuHub collects, uses, discloses, and protects your
              information when you use the platform.
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
                  Ambulance Hub · Lagos &amp; Accra
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
                <nav aria-label="Privacy policy sections" className="mt-3">
                  <ul className="space-y-0.5 text-sm">
                    {introTocItems.map((item) => (
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
                  AmbuHub (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
                  operates the website www.ambuhub.com (the &ldquo;Site&rdquo;) and
                  related services that connect users with ambulance and
                  emergency medical transport services (the &ldquo;Services&rdquo;).
                  This Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you visit our Site or use our
                  Services.
                </p>
                <p>
                  By accessing or using AmbuHub, you agree to the terms of this
                  Privacy Policy. If you do not agree, please do not use the Site
                  or Services.
                </p>
                <p>
                  AmbuHub is operated by Ambulance Hub, a company registered in
                  Nigeria &amp; Ghana, with its registered address in Lagos &amp;
                  Accra.
                </p>
              </Section>

              <Section id="scope" number="2" title="Scope of This Policy">
                <p>This Policy applies to information collected through:</p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>The AmbuHub website (www.ambuhub.com)</li>
                  <li>AmbuHub mobile applications (if applicable)</li>
                  <li>
                    Customer support communications (phone, email, chat)
                  </li>
                  <li>
                    Dispatch and booking interactions with ambulance/EMS
                    partners through our platform
                  </li>
                </ul>
                <p className="mt-5 font-semibold text-blue-950">
                  This Policy does <span className="uppercase">not</span> apply
                  to any third-party sites/apps linked from AmbuHub, which
                  maintain their own privacy policies.
                </p>
              </Section>

              <Section
                id="information-we-collect"
                number="3"
                title="Information We Collect"
              >
                <SubHeading>3.1 Information You Provide Directly</SubHeading>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    <strong className="text-blue-950">Identity information:</strong>{" "}
                    full name, date of birth, government ID (where required for
                    verification)
                  </li>
                  <li>
                    <strong className="text-blue-950">Contact information:</strong>{" "}
                    phone number, email address, home/pickup address
                  </li>
                  <li>
                    <strong className="text-blue-950">Account credentials:</strong>{" "}
                    username, password (stored encrypted)
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Emergency request details:
                    </strong>{" "}
                    nature of emergency, pickup/drop-off location, requested
                    service level
                  </li>
                  <li>
                    <strong className="text-blue-950">Health information:</strong>{" "}
                    medical condition, symptoms, allergies, current medications,
                    and other information relevant to dispatch and patient care,
                    where voluntarily provided or required for service delivery
                  </li>
                  <li>
                    <strong className="text-blue-950">Payment information:</strong>{" "}
                    billing address, payment card details (processed via our
                    payment processor &mdash; see Section 8)
                  </li>
                  <li>
                    <strong className="text-blue-950">Insurance information:</strong>{" "}
                    insurer name, policy/member ID, where applicable
                  </li>
                  <li>
                    <strong className="text-blue-950">Communications:</strong>{" "}
                    records of calls, chats, or emails with our support or
                    dispatch team
                  </li>
                </ul>

                <SubHeading>3.2 Information Collected Automatically</SubHeading>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    <strong className="text-blue-950">Device information:</strong>{" "}
                    IP address, browser type, operating system, device
                    identifiers
                  </li>
                  <li>
                    <strong className="text-blue-950">Location data:</strong> GPS
                    or network-based location, with your permission, to dispatch
                    the nearest available ambulance and provide accurate ETAs
                  </li>
                  <li>
                    <strong className="text-blue-950">Usage data:</strong> pages
                    visited, features used, timestamps, referring URLs
                  </li>
                  <li>
                    Cookies and similar technologies (see Section 9)
                  </li>
                </ul>

                <SubHeading>3.3 Information From Third Parties</SubHeading>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    Ambulance/EMS provider partners (e.g., confirmation of
                    dispatch, treatment summaries)
                  </li>
                  <li>
                    Hospitals or receiving medical facilities, where
                    coordination is necessary for patient handoff
                  </li>
                  <li>
                    Insurance providers, for claims and billing verification
                  </li>
                  <li>
                    Payment processors and identity verification vendors,
                    including payment processors and identity verification
                    providers.
                  </li>
                </ul>
              </Section>

              <Section
                id="how-we-use"
                number="4"
                title="How We Use Your Information"
              >
                <p>We use the information we collect to:</p>
                <ul className="list-disc space-y-2.5 pl-6 marker:text-blue-600">
                  <li>
                    Dispatch ambulances and coordinate emergency or
                    non-emergency medical transport
                  </li>
                  <li>
                    Verify your identity and the validity of service requests
                  </li>
                  <li>
                    Communicate with you about your request, booking, or
                    account
                  </li>
                  <li>
                    Process payments and billing, including insurance claims
                    where applicable
                  </li>
                  <li>
                    Improve the safety, reliability, and performance of our
                    Services
                  </li>
                  <li>
                    Comply with legal, regulatory, and law enforcement
                    obligations
                  </li>
                  <li>
                    Detect and prevent fraud, abuse, or misuse of the Services
                  </li>
                  <li>
                    Send service-related notifications and, with your consent,
                    marketing communications
                  </li>
                </ul>
                <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4 font-semibold text-blue-950">
                  We do not use health information for advertising purposes.
                </p>
              </Section>

              <Section
                id="legal-basis"
                number="5"
                title="Legal Basis for Processing (EEA/UK Users)"
              >
                <p>
                  If you are located in the European Economic Area or United
                  Kingdom, we process your personal data under the following
                  legal bases:
                </p>
                <ul className="list-disc space-y-2.5 pl-6 marker:text-blue-600">
                  <li>
                    <strong className="text-blue-950">Vital interests</strong>{" "}
                    &mdash; to protect your life or physical safety in an
                    emergency
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Performance of a contract
                    </strong>{" "}
                    &mdash; to provide the Services you request
                  </li>
                  <li>
                    <strong className="text-blue-950">Legal obligation</strong>{" "}
                    &mdash; to comply with healthcare, safety, and
                    emergency-response regulations
                  </li>
                  <li>
                    <strong className="text-blue-950">Consent</strong> &mdash;
                    for optional features such as marketing communications
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Legitimate interests
                    </strong>{" "}
                    &mdash; to maintain and improve our platform, prevent fraud,
                    and ensure security
                  </li>
                </ul>
              </Section>

              <Section
                id="how-we-share"
                number="6"
                title="How We Share Your Information"
              >
                <p className="rounded-xl border border-cyan-200/70 bg-cyan-50/70 p-4 font-semibold text-slate-800">
                  We share information only as necessary to provide and improve
                  our Services, and never sell personal or health information.
                </p>
                <p>We may share information with:</p>
                <ul className="list-disc space-y-2.5 pl-6 marker:text-blue-600">
                  <li>
                    Ambulance, paramedic, and EMS service providers fulfilling
                    your request
                  </li>
                  <li>
                    Hospitals and receiving healthcare facilities, for
                    continuity of care
                  </li>
                  <li>
                    Payment processors and billing partners, to process
                    transactions
                  </li>
                  <li>
                    Insurance companies, where you have authorized claims
                    processing
                  </li>
                  <li>
                    Service providers and subprocessors who support our
                    platform (e.g., cloud hosting, customer support tools),
                    under contractual confidentiality obligations
                  </li>
                  <li>
                    Regulators, law enforcement, or courts, where required by
                    law or to protect health and safety
                  </li>
                  <li>
                    Successors, in the event of a merger, acquisition, or sale
                    of assets, subject to equivalent privacy protections
                  </li>
                </ul>
              </Section>

              <Section
                id="hipaa"
                number="7"
                title="Health Information and HIPAA"
              >
                <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-950">
                  <strong>Note:</strong> Applicability of HIPAA (&ldquo;Covered
                  Entity,&rdquo; &ldquo;Business Associate,&rdquo; or neither) is
                  a legal determination that defines specific obligations.
                  Confirm your classification with counsel and complete the
                  placeholder text below accordingly.
                </p>
                <p>
                  Where applicable, AmbuHub safeguards Protected Health
                  Information (PHI) in accordance with the Health Insurance
                  Portability and Accountability Act (HIPAA) and its implementing
                  regulations. This includes maintaining administrative,
                  physical, and technical safeguards designed to protect the
                  confidentiality, integrity, and availability of PHI.
                </p>
                <p>
                  If AmbuHub is a HIPAA Covered Entity, insert and link your
                  full Notice of Privacy Practices here, including your
                  patients&rsquo; rights to access, amend, and restrict use of
                  their PHI, and how to file a complaint with the U.S. Department
                  of Health and Human Services.
                </p>
                <p>
                  We enter into Business Associate Agreements (BAAs) with
                  third-party vendors who handle PHI on our behalf, where
                  required.
                </p>
              </Section>

              <Section
                id="payments"
                number="8"
                title="Payment Information"
              >
                <p>
                  Payments made through AmbuHub are processed by our payment
                  processor. We do not store full payment card numbers on our
                  servers. Our payment processor maintains its own privacy and
                  security practices, which you can review on their website.
                </p>
              </Section>

              <Section
                id="cookies"
                number="9"
                title="Cookies and Tracking Technologies"
              >
                <p>
                  We use cookies and similar technologies to operate our Site,
                  remember preferences, and understand usage patterns. Categories
                  of cookies we use include:
                </p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    <strong className="text-blue-950">Essential cookies</strong>{" "}
                    &mdash; required for the Site and Services to function
                    (e.g., session management, security)
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Performance/analytics cookies
                    </strong>{" "}
                    &mdash; help us understand how visitors use the Site
                  </li>
                  <li>
                    <strong className="text-blue-950">
                      Functionality cookies
                    </strong>{" "}
                    &mdash; remember your preferences and settings
                  </li>
                </ul>
                <p>
                  We currently use the following analytics or advertising
                  tools: common web analytics and advertising tools to improve
                  the experience and measure performance.
                </p>
                <p>
                  You can control cookies through your browser settings.
                  Disabling certain cookies may limit functionality,
                  particularly features required for emergency dispatch.
                </p>
              </Section>

              <Section id="retention" number="10" title="Data Retention">
                <p>
                  We retain personal and health information for as long as
                  necessary to provide the Services, comply with legal and
                  regulatory obligations (including applicable medical record
                  retention laws &mdash; confirm the retention period applicable
                  to your operating jurisdictions and update this section),
                  resolve disputes, and enforce our agreements. When information
                  is no longer needed, we securely delete or anonymize it.
                </p>
              </Section>

              <Section id="security" number="11" title="Data Security">
                <p>
                  We implement industry-standard administrative, technical, and
                  physical safeguards designed to protect your information,
                  including:
                </p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>Encryption of data in transit (TLS) and at rest</li>
                  <li>
                    Access controls limiting data access to authorized
                    personnel on a need-to-know basis
                  </li>
                  <li>Regular security assessments and monitoring</li>
                  <li>Employee training on data privacy and confidentiality</li>
                </ul>
                <p className="mt-5">
                  No method of transmission or storage is 100% secure. In the
                  event of a data breach affecting your personal information, we
                  will notify you and relevant authorities as required by
                  applicable law.
                </p>
              </Section>

              <Section id="rights" number="12" title="Your Privacy Rights">
                <p>Depending on your location, you may have the right to:</p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>Access the personal information we hold about you</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>
                    Request deletion of your information, subject to legal
                    retention requirements
                  </li>
                  <li>
                    Restrict or object to certain processing of your
                    information
                  </li>
                  <li>
                    Receive a copy of your information in a portable format
                  </li>
                  <li>Withdraw consent, where processing is based on consent</li>
                  <li>Opt out of marketing communications at any time</li>
                </ul>
                <p className="mt-5">
                  To exercise these rights, contact us at{" "}
                  <Link
                    href="mailto:Contact@ambuhub.com"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Contact@ambuhub.com
                  </Link>
                  . We will respond within the timeframe required by applicable
                  law.
                </p>
                <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-950">
                  <strong>California residents:</strong> You may have additional
                  rights under the California Consumer Privacy Act (CCPA/CPRA),
                  including the right to know, delete, correct, and opt out of
                  the sale or sharing of personal information. AmbuHub does not
                  sell personal information.
                </p>
              </Section>

              <Section id="children" number="13" title="Children's Privacy">
                <p>
                  AmbuHub&rsquo;s Services are not directed to children under the
                  age of 18yrs. We do not knowingly collect personal information
                  from children, except where necessary to dispatch emergency
                  medical assistance for a minor, in which case information is
                  handled in accordance with applicable law and used solely for
                  that purpose.
                </p>
              </Section>

              <Section
                id="international"
                number="14"
                title="International Data Transfers"
              >
                <p>
                  Your information may be transferred to and processed in
                  countries other than your country of residence. Where
                  required, we use appropriate safeguards such as Standard
                  Contractual Clauses to protect information transferred
                  internationally. Confirm the list of destination countries
                  applicable to your operations and update this section.
                </p>
              </Section>

              <Section
                id="third-party"
                number="15"
                title="Third-Party Links"
              >
                <p>
                  Our Site may contain links to third-party websites or services
                  not operated by us. We are not responsible for the privacy
                  practices of these third parties. We encourage you to review
                  their privacy policies.
                </p>
              </Section>

              <Section
                id="changes"
                number="16"
                title="Changes to This Privacy Policy"
              >
                <p>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or legal requirements. We will post
                  the updated Policy on this page with a revised &ldquo;Last
                  Updated&rdquo; date, and where changes are material, we will
                  provide additional notice (such as email or an in-app
                  notification).
                </p>
              </Section>

              <Section id="contact" number="17" title="Contact Us">
                <p>
                  If you have questions, concerns, or requests regarding this
                  Privacy Policy or our data practices, please contact us:
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                      contact@ambuhub.com
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-900/60">
                      Data Protection Officer
                    </p>
                    <Link
                      href="mailto:Contact@ambuhub.com"
                      className="mt-1 block text-sm font-semibold text-blue-800 hover:underline"
                    >
                      Contact@ambuhub.com
                    </Link>
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
                  &copy; {new Date().getFullYear()} Ambulance Hub (AmbuHub). All
                  rights reserved.
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
