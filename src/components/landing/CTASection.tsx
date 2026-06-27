"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Phone, Send } from "lucide-react";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
} from "@/lib/contact-info";

const ease = [0.22, 1, 0.36, 1] as const;

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

const inputClasses =
  "w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none transition-colors placeholder:text-blue-900/35 focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/20";

export function CTASection() {
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
    <section
      id="contact"
      className="border-t border-blue-200/40 bg-gradient-to-b from-cyan-50/50 via-blue-50 to-sky-100/60 py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl lg:text-4xl">
            Ready to list or book on Ambuhub?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-blue-900/75 sm:mt-4 sm:text-base lg:text-lg">
            Tell us about your event, fleet, or storefront and we will follow up
            with next steps for a tailored walkthrough.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 sm:mt-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease }}
            className="flex flex-col gap-4"
          >
            <a
              href={CONTACT_EMAIL_HREF}
              className="flex items-start gap-4 rounded-2xl border-2 border-sky-200/70 bg-white p-5 shadow-md shadow-sky-600/5 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-600/15"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-600/30">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-blue-900/55">
                  Email us
                </span>
                <span className="mt-1 block break-words text-sm font-medium text-blue-950">
                  {CONTACT_EMAIL}
                </span>
              </span>
            </a>

            <a
              href={CONTACT_PHONE_HREF}
              className="flex items-start gap-4 rounded-2xl border-2 border-sky-200/70 bg-white p-5 shadow-md shadow-sky-600/5 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-600/15"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-800 text-white shadow-md shadow-indigo-700/30">
                <Phone className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-blue-900/55">
                  Call us
                </span>
                <span className="mt-1 block break-words text-sm font-medium text-blue-950">
                  {CONTACT_PHONE_DISPLAY}
                </span>
              </span>
            </a>

            <div className="rounded-2xl border-2 border-blue-200/70 bg-gradient-to-br from-white to-blue-50/80 p-5 shadow-md">
              <p className="text-sm font-semibold text-blue-950">
                Prefer the full contact page?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-blue-900/70">
                See all the ways to reach us, including office hours and location.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex text-sm font-semibold text-ambuhub-brand transition-colors hover:text-ambuhub-brand-dark"
              >
                Visit the contact page
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
            className="rounded-3xl border-2 border-sky-200/70 bg-white p-5 shadow-xl shadow-sky-700/10 sm:p-8"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease }}
                className="flex flex-col items-center justify-center py-10 text-center sm:py-12"
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
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-blue-950 sm:text-2xl">
                    Send us a message
                  </h3>
                  <p className="mt-2 text-sm text-blue-900/70">
                    Fill in the form below and we will be in touch.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
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
                      className={inputClasses}
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
                      className={inputClasses}
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
                    className={inputClasses}
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
                    className={`resize-y ${inputClasses}`}
                  />
                </label>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-6 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:self-start"
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

                <p className="text-xs text-blue-900/50">
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
      </div>
    </section>
  );
}
