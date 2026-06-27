"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const contactDetails = [
  {
    label: "Email us",
    value: "hello@ambuhub.example",
    href: "mailto:hello@ambuhub.example",
    icon: Mail,
    accent:
      "bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-600/30",
  },
  {
    label: "Call us",
    value: "+234 800 000 0000",
    href: "tel:+2348000000000",
    icon: Phone,
    accent:
      "bg-gradient-to-br from-indigo-600 to-blue-800 shadow-indigo-700/30",
  },
  {
    label: "Visit us",
    value: "Lagos, Nigeria",
    href: "https://maps.google.com/?q=Lagos,Nigeria",
    icon: MapPin,
    accent: "bg-gradient-to-br from-cyan-500 to-teal-600 shadow-teal-600/30",
  },
  {
    label: "Office hours",
    value: "Mon–Fri, 9:00 – 18:00 WAT",
    href: null,
    icon: Clock,
    accent: "bg-gradient-to-br from-blue-600 to-sky-700 shadow-blue-700/30",
  },
] as const;

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactPageContent() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    // No contact endpoint yet: simulate a send so the UX is complete.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setSubmitted(true);
    setForm(EMPTY_FORM);
  }

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
              <MessageSquare className="h-3.5 w-3.5 text-sky-400" aria-hidden />
              We usually reply within one business day
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get in touch
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Questions about booking coverage, listing your services, or
              partnering with Ambuhub? Tell us what you need and the right person
              on our team will follow up.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl">
              Contact details
            </h2>
            <p className="mt-3 text-base leading-relaxed text-blue-900/70">
              Reach us through any of the channels below, or send a message using
              the form and we will get back to you.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {contactDetails.map((item, i) => {
                const Icon = item.icon;
                const inner = (
                  <>
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${item.accent}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-blue-900/55">
                        {item.label}
                      </span>
                      <span className="mt-1 block break-words text-sm font-medium text-blue-950">
                        {item.value}
                      </span>
                    </span>
                  </>
                );
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: i * 0.08, ease }}
                  >
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          item.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="flex h-full items-start gap-4 rounded-2xl border-2 border-sky-200/70 bg-white p-5 shadow-md shadow-sky-600/5 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-600/15"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="flex h-full items-start gap-4 rounded-2xl border-2 border-sky-200/70 bg-white p-5 shadow-md shadow-sky-600/5">
                        {inner}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border-2 border-blue-200/70 bg-gradient-to-br from-white to-blue-50/80 p-6 shadow-md">
              <p className="text-sm font-semibold text-blue-950">
                Looking to book or list right away?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-blue-900/70">
                Create an account to browse providers or publish your services on
                the marketplace.
              </p>
              <Link
                href="/auth?signup=1"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ambuhub-brand transition-colors hover:text-ambuhub-brand-dark"
              >
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
            className="rounded-3xl border-2 border-sky-200/70 bg-white p-6 shadow-xl shadow-sky-700/10 sm:p-8"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 className="h-8 w-8" aria-hidden />
                </span>
                <h3 className="mt-6 text-xl font-bold text-blue-950">
                  Message sent
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-blue-900/70">
                  Thanks for reaching out. Our team will get back to you at the
                  email you provided as soon as possible.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-ambuhub-200 bg-white px-5 py-2.5 text-sm font-semibold text-ambuhub-brand transition-colors hover:bg-ambuhub-50"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-blue-950">
                    Send us a message
                  </h2>
                  <p className="mt-2 text-sm text-blue-900/70">
                    Fill in the form below and we will be in touch.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-blue-950">
                      Full name
                    </span>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Jane Doe"
                      className="rounded-xl border border-ambuhub-200 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-colors placeholder:text-blue-900/35 focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/20"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-blue-950">
                      Email
                    </span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                      className="rounded-xl border border-ambuhub-200 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-colors placeholder:text-blue-900/35 focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/20"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-blue-950">
                    Subject
                  </span>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    placeholder="How can we help?"
                    className="rounded-xl border border-ambuhub-200 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-colors placeholder:text-blue-900/35 focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/20"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-blue-950">
                    Message
                  </span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Tell us a bit about what you need…"
                    className="resize-y rounded-xl border border-ambuhub-200 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-colors placeholder:text-blue-900/35 focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/20"
                  />
                </label>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-6 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    "Sending…"
                  ) : (
                    <>
                      Send message
                      <Send className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs text-blue-900/50">
                  By sending this message you agree to our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-ambuhub-brand hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
