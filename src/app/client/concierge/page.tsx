"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  ConciergeBell,
  Loader2,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CountrySelect } from "@/components/ui/CountrySelect";
import {
  CONCIERGE_SOMETHING_ELSE_LABEL,
  CONCIERGE_SOMETHING_ELSE_SLUG,
  fetchServiceCategoryOptions,
  submitConciergeRequest,
  type ServiceCategoryOption,
} from "@/lib/concierge";
import { fetchAuthMe } from "@/lib/marketplace-cart";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25";

const selectClass = `${fieldClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`;

const labelClass = "block text-sm font-medium text-slate-700";

function displayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export default function ClientConciergePage() {
  const pathname = usePathname();
  const loginHref = `/auth?next=${encodeURIComponent(pathname || "/client/concierge")}`;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ServiceCategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug],
  );

  const categoryIsSomethingElse = categorySlug === CONCIERGE_SOMETHING_ELSE_SLUG;

  const departmentOptions = useMemo(() => {
    if (categoryIsSomethingElse) {
      return [{ slug: CONCIERGE_SOMETHING_ELSE_SLUG, name: CONCIERGE_SOMETHING_ELSE_LABEL }];
    }
    const departments = selectedCategory?.departments ?? [];
    return [
      ...departments,
      { slug: CONCIERGE_SOMETHING_ELSE_SLUG, name: CONCIERGE_SOMETHING_ELSE_LABEL },
    ];
  }, [categoryIsSomethingElse, selectedCategory]);

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setCategoriesError(null);
    setLoadingCategories(true);

    try {
      const [{ user, ok }, categoryRows] = await Promise.all([
        fetchAuthMe(),
        fetchServiceCategoryOptions().catch(() => {
          throw new Error("Could not load service categories.");
        }),
      ]);

      if (!ok || !user) {
        setLoadError("Sign in to submit a concierge request.");
        return;
      }

      setName(displayName(user.firstName, user.lastName));
      setPhone(user.phone);
      setEmail(user.email);
      setCountryCode(user.countryCode.trim().toLowerCase());
      setCategories(categoryRows);
    } catch (err) {
      if (err instanceof Error && err.message.includes("categories")) {
        setCategoriesError(err.message);
      } else {
        setLoadError(
          err instanceof Error ? err.message : "Could not load concierge form.",
        );
      }
    } finally {
      setLoading(false);
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  useEffect(() => {
    if (categoryIsSomethingElse) {
      setDepartmentSlug(CONCIERGE_SOMETHING_ELSE_SLUG);
    } else {
      setDepartmentSlug("");
    }
  }, [categorySlug, categoryIsSomethingElse]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!name.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      setSubmitError("Please enter your phone number.");
      return;
    }
    if (!email.trim()) {
      setSubmitError("Please enter your email.");
      return;
    }
    if (!countryCode.trim()) {
      setSubmitError("Please select your country.");
      return;
    }
    if (!categorySlug) {
      setSubmitError("Please select a service category.");
      return;
    }
    if (!departmentSlug) {
      setSubmitError("Please select a department.");
      return;
    }
    if (description.trim().length < 10) {
      setSubmitError("Please describe what you need (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      await submitConciergeRequest({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        countryCode: countryCode.trim(),
        categorySlug,
        departmentSlug,
        description: description.trim(),
      });
      setDescription("");
      setSubmitSuccess(
        "Your request has been received successfully, our agent will contact you shortly",
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not send request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="flex items-center gap-2 bg-gradient-to-r from-[#004a7c] via-[#0069b4] to-cyan-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          <ConciergeBell
            className="h-8 w-8 text-cyan-600 sm:h-9 sm:w-9"
            aria-hidden
          />
          Concierge
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tell us what you need and our team will help arrange the right ambulance
          or medical transport service.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center py-12">
          <Loader2 className="h-9 w-9 animate-spin text-cyan-500" aria-label="Loading" />
        </div>
      ) : loadError ? (
        <div className="mt-8 space-y-3" role="alert">
          <div className="rounded-2xl border border-red-300/50 bg-gradient-to-br from-red-50 to-white px-4 py-3 text-sm text-red-900">
            {loadError}
          </div>
          <Link
            href={loginHref}
            className="inline-flex rounded-lg border border-cyan-400/40 bg-white px-3 py-2 text-sm font-semibold text-[#0069b4] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/60"
          >
            Go to sign in
          </Link>
        </div>
      ) : (
        <form
          className="relative mt-8 overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/30 p-5 shadow-[0_0_28px_-8px_rgba(34,211,238,0.3)] sm:p-6"
          onSubmit={(e) => void handleSubmit(e)}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400" />

          <h2 className="text-lg font-semibold text-[#0c4a6e]">
            Request details
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Your contact details are prefilled from your profile. You can change
            them before sending.
          </p>

          {categoriesError ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              {categoriesError}
            </p>
          ) : null}

          <div className="relative mt-5 space-y-4">
            <div>
              <label htmlFor="concierge-name" className={labelClass}>
                Name
              </label>
              <input
                id="concierge-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="concierge-phone" className={labelClass}>
                Phone number
              </label>
              <input
                id="concierge-phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="concierge-email" className={labelClass}>
                Email
              </label>
              <input
                id="concierge-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="concierge-country" className={labelClass}>
                Country
              </label>
              <CountrySelect
                id="concierge-country"
                value={countryCode}
                onChange={setCountryCode}
                required
                className={selectClass}
              />
              <p className="mt-1 text-xs text-slate-500">
                Click to open the country list and choose a different country if needed.
              </p>
            </div>

            <div>
              <label htmlFor="concierge-category" className={labelClass}>
                Service category
              </label>
              <select
                id="concierge-category"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                disabled={loadingCategories || !!categoriesError}
                required
                className={selectClass}
              >
                <option value="">
                  {loadingCategories ? "Loading categories…" : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
                <option value={CONCIERGE_SOMETHING_ELSE_SLUG}>
                  {CONCIERGE_SOMETHING_ELSE_LABEL}
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="concierge-department" className={labelClass}>
                Department
              </label>
              <select
                id="concierge-department"
                value={departmentSlug}
                onChange={(e) => setDepartmentSlug(e.target.value)}
                disabled={!categorySlug || categoryIsSomethingElse}
                required
                className={selectClass}
              >
                <option value="">
                  {!categorySlug
                    ? "Choose a category first"
                    : categoryIsSomethingElse
                      ? CONCIERGE_SOMETHING_ELSE_LABEL
                      : "Select a department"}
                </option>
                {departmentOptions.map((department) => (
                  <option key={department.slug} value={department.slug}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="concierge-description" className={labelClass}>
                Describe what you want
              </label>
              <textarea
                id="concierge-description"
                rows={6}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe in detail what service you want"
                className={`${fieldClass} resize-y min-h-[140px]`}
              />
            </div>

            {submitError ? (
              <p className="text-sm text-red-700" role="alert">
                {submitError}
              </p>
            ) : null}
            {submitSuccess ? (
              <div
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
                role="status"
              >
                <p className="flex items-start gap-2 font-medium">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {submitSuccess}
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || !!categoriesError}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0069b4] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#004a7c] disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
