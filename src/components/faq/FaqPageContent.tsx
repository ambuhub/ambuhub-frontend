"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Shield,
  UserRound,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

type FaqItem = {
  question: string;
  answer: string;
};

type FaqCategory = {
  id: string;
  title: string;
  icon: typeof CircleHelp;
  accent: string;
  items: FaqItem[];
};

const faqCategories: FaqCategory[] = [
  {
    id: "general",
    title: "General",
    icon: CircleHelp,
    accent: "from-sky-500 to-blue-600 shadow-sky-600/30",
    items: [
      {
        question: "What is Ambuhub?",
        answer:
          "Ambuhub is a marketplace for ambulance-related services. Organizers and buyers can discover, compare, and book medical transport, personnel, fleet servicing, and equipment from verified providers—all in one place.",
      },
      {
        question: "Is Ambuhub an emergency dispatch service?",
        answer:
          "No. Ambuhub is for planned bookings and marketplace transactions. If someone needs immediate professional medical care, contact your local medical helpline or public ambulance service right away.",
      },
      {
        question: "Who can use Ambuhub?",
        answer:
          "Anyone who needs to book coverage or equipment can sign up as a client. Ambulance operators, medical teams, fleet workshops, and equipment sellers can sign up as service providers and publish listings.",
      },
      {
        question: "Which countries does Ambuhub support?",
        answer:
          "The marketplace is built for operations in Nigeria and Ghana, with country-specific listings and pricing where providers publish them. More regions may be added over time.",
      },
    ],
  },
  {
    id: "clients",
    title: "For clients",
    icon: UserRound,
    accent: "from-indigo-600 to-blue-800 shadow-indigo-700/30",
    items: [
      {
        question: "How do I book ambulance coverage for an event?",
        answer:
          "Create a client account, browse the Medical transport or Personnel categories, and open listings marked for booking. Choose your dates on the provider's availability calendar, confirm scope and pricing, then complete checkout.",
      },
      {
        question: "What is the difference between Book, Hire, and Buy?",
        answer:
          "Book is for daily standby or scheduled coverage (e.g. event medical teams). Hire is for short-term rentals—vehicles, equipment, or personnel for a defined window. Buy is for purchasing equipment or stock outright through the marketplace.",
      },
      {
        question: "Can I add items to a cart before checking out?",
        answer:
          "Yes. Sale listings can be added to your cart and checked out together. Book and hire flows use dedicated booking or hire pages for each listing so dates, locations, and terms stay accurate.",
      },
      {
        question: "Where do I track my orders and bookings?",
        answer:
          "After signing in, open your client dashboard and Orders. There you can see purchase history, hire periods, and personnel bookings, along with links to receipts where available.",
      },
    ],
  },
  {
    id: "providers",
    title: "For providers",
    icon: Building2,
    accent: "from-cyan-500 to-teal-600 shadow-teal-600/30",
    items: [
      {
        question: "How do I list my services on Ambuhub?",
        answer:
          "Sign up as a provider, complete your business profile, then add listings from your provider dashboard. Choose the right category, listing type (sale, hire, or book), pricing, and availability or stock as applicable.",
      },
      {
        question: "How do I get paid?",
        answer:
          "Completed orders credit your provider wallet in the platform currency. You can view balances and request withdrawals from your provider dashboard when payout options are available for your account.",
      },
      {
        question: "Can I manage bookings and availability?",
        answer:
          "Yes. Providers with book listings can set schedules and availability windows. Bookings appear in your provider dashboard so you can coordinate dates, locations, and handoffs with clients.",
      },
      {
        question: "Do I need a subscription to list on Ambuhub?",
        answer:
          "Provider subscription plans may apply depending on your account and listing limits. Check the subscription section in your provider dashboard for current plans and what each tier includes.",
      },
    ],
  },
  {
    id: "payments",
    title: "Booking & payments",
    icon: CreditCard,
    accent: "from-blue-600 to-sky-700 shadow-blue-700/30",
    items: [
      {
        question: "How does checkout work?",
        answer:
          "When you book, hire, or buy, you review line items and totals on the checkout page. After payment is confirmed, you receive order confirmation and can access receipts from your account where supported.",
      },
      {
        question: "What currencies are supported?",
        answer:
          "Listings and wallets use supported marketplace currencies (such as NGN and GHS) depending on the provider and your region. Prices are shown on each listing before you commit.",
      },
      {
        question: "Can I cancel or change a booking?",
        answer:
          "Cancellation and change policies depend on the provider and listing type. Contact the provider through the platform where messaging is available, or reach out to Ambuhub support if you need help with an order.",
      },
    ],
  },
  {
    id: "safety",
    title: "Trust & safety",
    icon: Shield,
    accent: "from-violet-600 to-indigo-700 shadow-violet-700/30",
    items: [
      {
        question: "How are providers vetted?",
        answer:
          "Providers complete profile and business details before publishing. You can compare credentials, coverage areas, and reviews on listing pages before booking. We continue to improve verification as the platform grows.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Ambuhub uses secure checkout flows and does not store full card details on our servers. Always complete payments through the official checkout pages linked from the platform.",
      },
      {
        question: "What if I have a dispute with a provider?",
        answer:
          "Document the issue from your order details and contact us at hello@ambuhub.example with your order reference. We will help coordinate a fair resolution according to our terms and the facts of the booking.",
      },
    ],
  },
];

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `faq-${item.question.replace(/\s+/g, "-").toLowerCase().slice(0, 40)}`;

  return (
    <div className="border-b border-sky-200/60 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-blue-700"
      >
        <span className="text-base font-semibold text-blue-950">{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease }}
          className="mt-0.5 shrink-0 text-blue-900/50"
          aria-hidden
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-blue-900/70">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqCategorySection({
  category,
  index,
}: {
  category: FaqCategory;
  index: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const Icon = category.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease }}
      id={category.id}
      aria-labelledby={`${category.id}-heading`}
      className="rounded-2xl border-2 border-sky-200/70 bg-white p-6 shadow-lg shadow-sky-600/10 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${category.accent}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h2
          id={`${category.id}-heading`}
          className="text-xl font-semibold tracking-tight text-blue-950"
        >
          {category.title}
        </h2>
      </div>
      <div className="mt-4">
        {category.items.map((item, i) => (
          <FaqAccordionItem
            key={item.question}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </motion.section>
  );
}

export function FaqPageContent() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-blue-50/40 via-white to-sky-50/50">
      <section className="relative overflow-hidden bg-black">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgb(0 105 180 / 0.4) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgb(2 132 199 / 0.3) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 shadow-sm backdrop-blur sm:text-sm">
              <CircleHelp className="h-3.5 w-3.5 text-sky-400" aria-hidden />
              Answers at a glance
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Everything you need to know about booking coverage, listing services,
              and using the Ambuhub marketplace—whether you are a client or a
              provider.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-blue-200/50 bg-gradient-to-b from-sky-100/90 via-blue-50 to-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.nav
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease }}
            aria-label="FAQ categories"
            className="flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            {faqCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="rounded-full border border-sky-200/80 bg-white px-4 py-2 text-sm font-medium text-blue-900/80 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-blue-950"
              >
                {cat.title}
              </a>
            ))}
          </motion.nav>
        </div>
      </section>

      <section className="border-t border-blue-200/40 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          {faqCategories.map((category, i) => (
            <FaqCategorySection key={category.id} category={category} index={i} />
          ))}
        </div>
      </section>

      <section className="border-t border-blue-200/40 bg-gradient-to-b from-cyan-50/50 via-blue-50 to-sky-100/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 px-6 py-12 text-center shadow-2xl shadow-blue-900/35 ring-2 ring-white/25 sm:px-10 sm:py-14"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-35 mix-blend-soft-light"
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 20%, rgb(255 255 255 / 0.5), transparent 42%), radial-gradient(circle at 90% 80%, rgb(56 189 248 / 0.5), transparent 38%)",
              }}
            />
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Still have questions?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
                Our team is happy to help with bookings, listings, or anything
                else about Ambuhub.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-blue-700 shadow-md transition-colors hover:bg-sky-50"
                >
                  Contact us
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  How it works
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
