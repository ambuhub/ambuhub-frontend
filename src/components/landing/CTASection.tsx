"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export function CTASection() {
  return (
    <section id="contact" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl bg-gradient-to-br from-ambuhub-brand to-ambuhub-800 px-6 py-12 text-center shadow-xl sm:px-10 sm:py-14 lg:px-16"
        >
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to list or book on Ambuhub?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            Tell us about your event, fleet, or storefront. We will follow up with
            next steps for a tailored walkthrough.
          </p>
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="mailto:hello@ambuhub.example"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-ambuhub-brand shadow-md transition-colors hover:bg-ambuhub-50"
            >
              <Mail className="h-4 w-4" aria-hidden />
              Contact us
            </Link>
            <Link
              href="/#top"
              className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Back to top
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
