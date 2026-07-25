import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata(
  "Terms & Conditions",
  "Terms and conditions governing use of the AmbuHub marketplace platform and services at www.ambuhub.com. Effective July 25th, 2026.",
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

const tocItems = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "disclaimer", label: "Nature of Our Service — Disclaimer" },
  { id: "eligibility", label: "Eligibility and Account Registration" },
  { id: "use-of-services", label: "Use of the Services" },
  { id: "third-party-providers", label: "Third-Party Ambulance / EMS Providers" },
  { id: "fees-payment", label: "Fees and Payment" },
  { id: "cancellations", label: "Cancellations" },
  { id: "disclaimers", label: "Disclaimers of Warranties" },
  { id: "limitation-of-liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "privacy", label: "Privacy" },
  { id: "suspension-termination", label: "Suspension and Termination" },
  { id: "governing-law", label: "Governing Law and Dispute Resolution" },
  { id: "regulatory", label: "Regulatory Compliance" },
  { id: "modifications", label: "Modifications to These Terms" },
  { id: "severability", label: "Severability and Waiver" },
  { id: "contact", label: "Contact Us" },
];

export default function TermsPage() {
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
              Terms of use
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Terms &amp; Conditions
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              The rules that govern access to and use of the AmbuHub platform
              and services.
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
                  Ambu<span className="text-red-500">H</span>ub · Ghana
                  &amp; Nigeria
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
                <nav aria-label="Terms and conditions sections" className="mt-3">
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
              <Section id="acceptance" number="1" title="Acceptance of Terms">
                <p>
                  These Terms and Conditions (&ldquo;Terms&rdquo;) govern your
                  access to and use of www.ambuhub.com (the &ldquo;Site&rdquo;)
                  and any related applications, dispatch tools, or services
                  that connect you with ambulance and emergency medical
                  transport providers (collectively, the &ldquo;Services&rdquo;),
                  operated by AmbuHub (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                  &ldquo;our&rdquo;).
                </p>
                <p>
                  By accessing the Site, creating an account, or using the
                  Services, you agree to be bound by these Terms and our
                  Privacy Policy. If you do not agree, you must not access or
                  use the Services.
                </p>
                <p>
                  Ambu<span className="text-red-600">H</span>ub is operated
                  by Ambu<span className="text-red-600">H</span>ub, registered
                  in Ghana &amp; Nigeria.
                </p>
              </Section>

              <Section
                id="disclaimer"
                number="2"
                title="Nature of Our Service — Important Disclaimer"
              >
                <p>
                  AmbuHub is a technology platform that connects users with
                  independent third-party ambulance and emergency medical
                  transport providers. AmbuHub does not itself provide
                  ambulance, paramedic, or medical services, and is not a
                  medical provider, healthcare provider, or emergency dispatch
                  authority.
                </p>
                <p>
                  AmbuHub does not own, operate, or control the vehicles,
                  medical equipment, or personnel of any ambulance or EMS
                  provider listed or dispatched through the platform. All
                  medical care, transport, and clinical decisions are the sole
                  responsibility of the independent ambulance/EMS provider that
                  responds to your request.
                </p>
                <div className="rounded-2xl border border-red-200/80 bg-red-50/80 p-5 font-semibold leading-relaxed text-red-950">
                  <p className="text-sm uppercase tracking-wide text-red-800">
                    In a life-threatening emergency:
                  </p>
                  <p className="mt-2">
                    ALWAYS CALL YOUR LOCAL EMERGENCY NUMBER (e.g., 911, 999,
                    112) DIRECTLY IN ADDITION TO OR INSTEAD OF USING THIS
                    PLATFORM.
                  </p>
                  <p className="mt-2 font-medium">
                    Do NOT rely solely on AmbuHub for life-threatening
                    emergencies. Response times are NOT guaranteed and may be
                    affected by factors outside our control, including traffic,
                    weather, vehicle availability, and network connectivity.
                  </p>
                </div>
              </Section>

              <Section
                id="eligibility"
                number="3"
                title="Eligibility and Account Registration"
              >
                <ul className="list-disc space-y-2.5 pl-6 marker:text-blue-600">
                  <li>
                    You must be at least 18 years old to create an account, or
                    use the Services under the supervision of a parent or legal
                    guardian.
                  </li>
                  <li>
                    You agree to provide accurate, current, and complete
                    information during registration and to update it as
                    necessary.
                  </li>
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your account credentials and for all activity under your
                    account.
                  </li>
                  <li>
                    You must notify us immediately of any unauthorized use of
                    your account.
                  </li>
                  <li>
                    We reserve the right to suspend or terminate accounts that
                    provide false information, engage in fraudulent use, or
                    violate these Terms.
                  </li>
                </ul>
              </Section>

              <Section
                id="use-of-services"
                number="4"
                title="Use of the Services"
              >
                <SubHeading>4.1 Permitted Use</SubHeading>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    Requesting ambulance or non-emergency medical transport
                    through the platform
                  </li>
                  <li>
                    Managing your account, billing information, and service
                    history
                  </li>
                  <li>
                    Communicating with dispatch and support teams regarding
                    your requests
                  </li>
                </ul>

                <SubHeading>4.2 Prohibited Use</SubHeading>
                <p>You agree not to:</p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    Submit false, fraudulent, or malicious requests for
                    ambulance or medical services
                  </li>
                  <li>
                    Use the Services for any unlawful purpose or in violation
                    of any applicable regulation
                  </li>
                  <li>
                    Interfere with, disrupt, or attempt to gain unauthorized
                    access to our systems or networks
                  </li>
                  <li>
                    Misrepresent your identity, medical condition, or location
                    when requesting services
                  </li>
                  <li>
                    Use automated means (bots, scrapers) to access or interact
                    with the Site without our prior written consent
                  </li>
                  <li>
                    Resell, sublicense, or commercially exploit the Services
                    without authorization
                  </li>
                </ul>
                <p className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-950">
                  <strong>Note:</strong> Misuse of emergency dispatch features,
                  including false emergency requests, may be reported to law
                  enforcement and may result in civil or criminal liability
                  under applicable law.
                </p>
              </Section>

              <Section
                id="third-party-providers"
                number="5"
                title="Third-Party Ambulance and EMS Providers"
              >
                <p>
                  Ambulance and EMS providers available through AmbuHub are
                  independent third parties, not employees, agents, or
                  representatives of AmbuHub. Accordingly:
                </p>
                <ul className="list-disc space-y-2.5 pl-6 marker:text-blue-600">
                  <li>
                    AmbuHub does not guarantee the availability,
                    qualifications, licensing, conduct, or performance of any
                    third-party provider
                  </li>
                  <li>
                    Each provider is independently responsible for compliance
                    with applicable medical, safety, and licensing regulations
                    in their jurisdiction
                  </li>
                  <li>
                    Any dispute regarding the quality of medical care, billing,
                    or conduct of a provider should first be directed to that
                    provider; AmbuHub will assist in good faith but is not
                    responsible for resolving such disputes
                  </li>
                  <li>
                    Providers listed on AmbuHub are required to hold valid
                    licensure and certification as required under state EMS
                    regulations.
                  </li>
                </ul>
              </Section>

              <Section
                id="fees-payment"
                number="6"
                title="Fees and Payment"
              >
                <ul className="list-disc space-y-2.5 pl-6 marker:text-blue-600">
                  <li>
                    Fees for ambulance and transport services are set by the
                    responding provider and may vary by location, service
                    level, and distance
                  </li>
                  <li>
                    You authorize AmbuHub and/or its payment processor to
                    charge your selected payment method for all fees incurred
                    through the Services
                  </li>
                  <li>
                    Where insurance coverage applies, you are responsible for
                    any deductibles, copayments, or amounts not covered by
                    your insurer
                  </li>
                  <li>
                    All fees are non-refundable once a provider has been
                    dispatched, except as required by law or as otherwise
                    stated in our refund policy
                  </li>
                  <li>
                    Late or failed payments may be subject to a fee of 10% and
                    may result in suspension of your account.
                  </li>
                </ul>
                <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-950">
                  <strong>Payment processors:</strong> Our designated payment
                  processors include Stripe and Paystack.
                </p>
              </Section>

              <Section
                id="cancellations"
                number="7"
                title="Cancellations"
              >
                <p>
                  You may cancel a non-emergency transport request prior to
                  dispatch confirmation at no charge. Once a provider has been
                  dispatched, a cancellation fee of 20% may apply. Cancellation
                  of an active emergency response after dispatch may still
                  incur charges from the responding provider.
                </p>
              </Section>

              <Section
                id="disclaimers"
                number="8"
                title="Disclaimers of Warranties"
              >
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-800">
                  <p className="font-semibold">
                    THE SERVICES ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND
                    &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT WARRANTIES OF ANY
                    KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
                    TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                    PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </div>
                <p>We do not warrant that:</p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>
                    The Services will be uninterrupted, timely, secure, or
                    error-free
                  </li>
                  <li>
                    Any ambulance or provider will be available at the time of
                    your request
                  </li>
                  <li>
                    Response times displayed on the platform will be accurate
                    or met
                  </li>
                  <li>The Services are suitable for all emergency situations</li>
                </ul>
              </Section>

              <Section
                id="limitation-of-liability"
                number="9"
                title="Limitation of Liability"
              >
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-800">
                  <p className="font-semibold">
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AMBUHUB,
                    ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AFFILIATES SHALL
                    NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                    CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
                    LIMITED TO LOSS OF LIFE, PERSONAL INJURY, EMOTIONAL
                    DISTRESS, LOSS OF DATA, OR LOSS OF PROFITS, ARISING FROM OR
                    RELATED TO YOUR USE OF THE SERVICES OR ANY ACTS OR
                    OMISSIONS OF THIRD-PARTY PROVIDERS.
                  </p>
                </div>
                <p>
                  TO THE EXTENT PERMITTED BY LAW, AMBUHUB&rsquo;S TOTAL
                  AGGREGATE LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR
                  THE SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID TO AMBUHUB
                  IN THE 12 MONTHS PRECEDING THE CLAIM.
                </p>
                <p>
                  Some jurisdictions do not allow the exclusion or limitation
                  of certain damages. In such jurisdictions, our liability is
                  limited to the maximum extent permitted by applicable law.
                </p>
                <p>
                  Nothing in these Terms is intended to limit liability for
                  death or personal injury caused by our gross negligence or
                  willful misconduct, where such limitation is not permitted by
                  law.
                </p>
              </Section>

              <Section
                id="indemnification"
                number="10"
                title="Indemnification"
              >
                <p>
                  You agree to indemnify, defend, and hold harmless AmbuHub
                  and its officers, directors, employees, and affiliates from
                  any claims, damages, losses, liabilities, and expenses
                  (including legal fees) arising from:
                </p>
                <ul className="list-disc space-y-2 pl-6 marker:text-blue-600">
                  <li>Your violation of these Terms</li>
                  <li>
                    Your misuse of the Services, including submission of false
                    or fraudulent requests
                  </li>
                  <li>
                    Your violation of any applicable law or third-party rights
                  </li>
                </ul>
              </Section>

              <Section
                id="intellectual-property"
                number="11"
                title="Intellectual Property"
              >
                <p>
                  All content, trademarks, logos, software, and materials on
                  the Site are owned by or licensed to AmbuHub and are protected
                  by intellectual property laws. You are granted a limited,
                  non-exclusive, non-transferable license to access and use the
                  Site for personal, non-commercial purposes in accordance with
                  these Terms.
                </p>
                <p>
                  You may not copy, modify, distribute, sell, or lease any part
                  of the Site or its content without our prior written consent.
                </p>
              </Section>

              <Section id="privacy" number="12" title="Privacy">
                <p>
                  Your use of the Services is also governed by our{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  , which describes how we collect, use, and protect your
                  personal and health information. By using the Services, you
                  consent to the data practices described in our Privacy
                  Policy.
                </p>
              </Section>

              <Section
                id="suspension-termination"
                number="13"
                title="Suspension and Termination"
              >
                <p>
                  We may suspend or terminate your access to the Services at
                  any time, with or without notice, for conduct that we believe
                  violates these Terms, is harmful to other users, providers,
                  or AmbuHub, or is otherwise required by law.
                </p>
                <p>
                  You may terminate your account at any time by contacting us.
                  Termination does not relieve you of any payment obligations
                  incurred prior to termination.
                </p>
              </Section>

              <Section
                id="governing-law"
                number="14"
                title="Governing Law and Dispute Resolution"
              >
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of{" "}
                  <strong className="text-blue-950">
                    [INSERT GOVERNING JURISDICTION]
                  </strong>
                  , without regard to its conflict of law principles.
                </p>
                <p>
                  Any dispute arising from these Terms or the Services shall
                  be resolved through{" "}
                  <strong className="text-blue-950">
                    [INSERT DISPUTE RESOLUTION MECHANISM — e.g., binding
                    arbitration administered by (ARBITRATION BODY), or the
                    courts located in (JURISDICTION)]
                  </strong>
                  .
                </p>
                <p className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-950">
                  <strong>Confirm with counsel:</strong> Whether a class action
                  waiver is included, and whether such a provision is
                  enforceable in your jurisdiction(s) of operation.
                </p>
              </Section>

              <Section
                id="regulatory"
                number="15"
                title="Regulatory Compliance"
              >
                <p>
                  AmbuHub and its partner providers operate in compliance with
                  applicable emergency medical services regulations in{" "}
                  <strong className="text-blue-950">
                    [INSERT JURISDICTIONS OF OPERATION — e.g., Ghana, Nigeria]
                  </strong>
                  . Nothing in these Terms shall be construed as relieving any
                  party of compliance obligations under applicable EMS,
                  healthcare, or transportation regulations.
                </p>
                <p>
                  AmbuHub is not a substitute for official emergency dispatch
                  systems. Where required by local law, requests may be
                  automatically routed to or coordinated with official
                  emergency dispatch authorities.
                </p>
              </Section>

              <Section
                id="modifications"
                number="16"
                title="Modifications to These Terms"
              >
                <p>
                  We may revise these Terms from time to time. Material changes
                  will be communicated via the Site or email prior to taking
                  effect. Continued use of the Services after changes take
                  effect constitutes acceptance of the revised Terms.
                </p>
              </Section>

              <Section
                id="severability"
                number="17"
                title="Severability and Waiver"
              >
                <p>
                  If any provision of these Terms is found to be unenforceable
                  or invalid, that provision will be limited or eliminated to
                  the minimum extent necessary, and the remaining provisions
                  will remain in full force and effect. Our failure to enforce
                  any right or provision of these Terms shall not be deemed a
                  waiver of such right or provision.
                </p>
              </Section>

              <Section id="contact" number="18" title="Contact Us">
                <p>
                  If you have questions about these Terms, please contact us:
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
                  &copy; {new Date().getFullYear()} Ambu
                  <span className="font-semibold text-red-600">H</span>ub. All
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
