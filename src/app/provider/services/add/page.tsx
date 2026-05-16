"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import { dispatchMarketplaceInvalidate } from "@/lib/cache-tags";
import {
  PRICING_PERIODS,
  formatPricingPeriodLabel,
  type PricingPeriod,
  isPricingPeriod,
} from "@/lib/pricing-period";
import { HireReturnWindowFields } from "@/components/provider/HireReturnWindowFields";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { StateProvinceSelect } from "@/components/ui/StateProvinceSelect";
import {
  EMPTY_HIRE_RETURN_WINDOW,
  validateHireReturnWindowClient,
  type HireReturnWindow,
} from "@/lib/hire-return-window";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Department = { name: string; slug: string; order: number };
type ListingType = "sale" | "hire" | "book";
type ServiceCategoryRow = {
  id: string;
  name: string;
  slug: string;
  departments: Department[];
};
const PERSONNEL_CATEGORY_SLUG = "personnel";
const AMBULANCE_SERVICING_CATEGORY_SLUG = "ambulance-servicing";
const BOOK_LISTING_TYPE_CATEGORY_SLUGS = new Set([
  PERSONNEL_CATEGORY_SLUG,
  AMBULANCE_SERVICING_CATEGORY_SLUG,
]);

const MEDICAL_TRANSPORT_CATEGORY_SLUG = "medical-transport";
const HIRE_LISTING_TYPE_CATEGORY_SLUGS = new Set([MEDICAL_TRANSPORT_CATEGORY_SLUG]);

export default function ProviderAddServicePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<ServiceCategoryRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [categorySlug, setCategorySlug] = useState("");
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [pricingPeriod, setPricingPeriod] = useState<PricingPeriod | "">("");
  const [hireReturnWindow, setHireReturnWindow] = useState<HireReturnWindow>(
    () => ({ ...EMPTY_HIRE_RETURN_WINDOW, daysOfWeek: [1, 2, 3, 4, 5] }),
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [fileList, setFileList] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_PROXY_PREFIX}/service-categories`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to load categories");
        }
        const data = (await res.json()) as {
          serviceCategories?: ServiceCategoryRow[];
        };
        if (!cancelled) {
          setCategories(data.serviceCategories ?? []);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load categories. Check your connection.");
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug],
  );
  const isBookListingTypeCategory = selectedCategory
    ? BOOK_LISTING_TYPE_CATEGORY_SLUGS.has(selectedCategory.slug)
    : false;
  const isHireListingTypeCategory = selectedCategory
    ? HIRE_LISTING_TYPE_CATEGORY_SLUGS.has(selectedCategory.slug)
    : false;

  const effectiveListingType = useMemo((): ListingType | "" => {
    if (isBookListingTypeCategory) return "book";
    if (isHireListingTypeCategory) return "hire";
    return listingType;
  }, [isBookListingTypeCategory, isHireListingTypeCategory, listingType]);

  const saleOrHireCommerce =
    effectiveListingType === "sale" || effectiveListingType === "hire";

  useEffect(() => {
    setDepartmentSlug("");
    setListingType("");
    setStock("");
    setPrice("");
    setPricingPeriod("");
  }, [categorySlug]);

  useEffect(() => {
    setStateProvince("");
  }, [countryCode]);

  useEffect(() => {
    if (listingType === "book") {
      setStock("");
      setPrice("");
      setPricingPeriod("");
    } else if (listingType === "sale") {
      setPricingPeriod("");
    }
  }, [listingType]);

  useEffect(() => {
    if (isBookListingTypeCategory) {
      setListingType("book");
    } else if (isHireListingTypeCategory) {
      setListingType("hire");
    }
  }, [isBookListingTypeCategory, isHireListingTypeCategory]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    if (!categorySlug || !departmentSlug) {
      setSubmitError("Select a category and department.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setSubmitError("Title and description are required.");
      return;
    }
    if (!isBookListingTypeCategory && !isHireListingTypeCategory && !listingType) {
      setSubmitError("Listing type is required for this category.");
      return;
    }
    if (effectiveListingType === "sale") {
      const parsedStock = Number(stock);
      if (!stock.trim() || !Number.isInteger(parsedStock) || parsedStock < 0) {
        setSubmitError("Stock is required and must be a non-negative integer.");
        return;
      }
      const parsedPrice = Number(price);
      if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setSubmitError("Price is required and must be a non-negative number.");
        return;
      }
    }
    if (effectiveListingType === "hire" && stock.trim()) {
      const parsedStock = Number(stock);
      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        setSubmitError("Stock must be a non-negative integer.");
        return;
      }
    }
    if (effectiveListingType === "hire" && price.trim()) {
      const parsedPrice = Number(price);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setSubmitError("Price must be a non-negative number.");
        return;
      }
    }
    if (effectiveListingType === "hire") {
      if (!pricingPeriod || !isPricingPeriod(pricingPeriod)) {
        setSubmitError("Select a pricing period for hire listings.");
        return;
      }
      const returnErr = validateHireReturnWindowClient(hireReturnWindow);
      if (returnErr) {
        setSubmitError(returnErr);
        return;
      }
    }
    if (!countryCode.trim()) {
      setSubmitError("Country is required.");
      return;
    }
    if (!stateProvince.trim()) {
      setSubmitError("State or province is required.");
      return;
    }
    if (!officeAddress.trim()) {
      setSubmitError("Office address is required.");
      return;
    }

    setSubmitting(true);
    try {
      let photoUrls: string[] = [];
      const imageFiles = fileList.filter((f) => f.type.startsWith("image/"));

      if (imageFiles.length > 0) {
        const formData = new FormData();
        for (const f of imageFiles) {
          formData.append("images", f);
        }
        const uploadRes = await fetch(`${API_PROXY_PREFIX}/uploads/service-images`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const uploadData = (await uploadRes.json()) as {
          urls?: string[];
          message?: string;
        };
        if (!uploadRes.ok) {
          throw new Error(uploadData.message ?? "Image upload failed");
        }
        photoUrls = uploadData.urls ?? [];
      }

      const createRes = await fetch(`${API_PROXY_PREFIX}/services`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          serviceCategorySlug: categorySlug,
          departmentSlug,
          listingType: isBookListingTypeCategory
            ? "book"
            : isHireListingTypeCategory
              ? "hire"
              : listingType,
          stock:
            effectiveListingType === "sale"
              ? Number(stock)
              : effectiveListingType === "hire"
                ? stock.trim()
                  ? Number(stock)
                  : null
                : null,
          price:
            effectiveListingType === "sale"
              ? Number(price)
              : effectiveListingType === "hire"
                ? price.trim()
                  ? Number(price)
                  : null
                : null,
          pricingPeriod:
            effectiveListingType === "hire" && isPricingPeriod(pricingPeriod)
              ? pricingPeriod
              : null,
          hireReturnWindow:
            effectiveListingType === "hire" ? hireReturnWindow : undefined,
          photoUrls,
          countryCode: countryCode.trim().toUpperCase(),
          stateProvince: stateProvince.trim(),
          officeAddress: officeAddress.trim(),
        }),
      });
      const createData = (await createRes.json()) as { message?: string };
      if (!createRes.ok) {
        throw new Error(createData.message ?? "Could not publish service");
      }

      dispatchMarketplaceInvalidate();
      router.push("/provider/listings");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-blue-200/90 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-600/30";
  const inputDisabledClass =
    "disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100/90 disabled:text-slate-500";
  const labelClass = "block text-sm font-semibold text-blue-950";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-5 shadow-xl shadow-blue-950/40 sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Add service
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-blue-100/90 sm:text-base">
          List standby coverage, scheduled transport, personnel, or equipment for
          venues and organizers.
        </p>
      </div>

      {loadError ? (
        <p className="mt-4 rounded-xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm">
          {loadError}
        </p>
      ) : null}

      <form
        className="mt-6 space-y-6 rounded-3xl border border-blue-100 bg-gradient-to-b from-white via-blue-50/40 to-cyan-50/50 p-6 shadow-lg shadow-blue-200/50 sm:p-8"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div>
          <label htmlFor="service-category" className={labelClass}>
            Service category
          </label>
          <select
            id="service-category"
            name="category"
            className={`${inputClass} ${inputDisabledClass}`}
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            disabled={loadingCategories || !!loadError}
          >
            <option value="">
              {loadingCategories ? "Loading…" : "Select a category"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="department" className={labelClass}>
            Department (sub-category)
          </label>
          <select
            id="department"
            name="department"
            className={`${inputClass} ${inputDisabledClass}`}
            value={departmentSlug}
            onChange={(e) => setDepartmentSlug(e.target.value)}
            disabled={!selectedCategory}
          >
            <option value="">
              {selectedCategory
                ? "Select a department"
                : "Choose a category first"}
            </option>
            {selectedCategory?.departments.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-6 rounded-2xl border border-blue-100/80 bg-white/60 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900/80">
            Office location
          </h2>
          <div>
            <label htmlFor="service-country" className={labelClass}>
              Country
            </label>
            <CountrySelect
              id="service-country"
              value={countryCode}
              onChange={setCountryCode}
              required
              className={`${inputClass} ${inputDisabledClass}`}
            />
          </div>
          <div>
            <label htmlFor="service-state" className={labelClass}>
              State / province
            </label>
            <StateProvinceSelect
              id="service-state"
              countryCode={countryCode}
              value={stateProvince}
              onChange={setStateProvince}
              required
              disabled={!countryCode.trim()}
              className={`${inputClass} ${inputDisabledClass}`}
            />
          </div>
          <div>
            <label htmlFor="office-address" className={labelClass}>
              Office address
            </label>
            <textarea
              id="office-address"
              name="officeAddress"
              required
              rows={3}
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              className={inputClass}
              placeholder="Street, building, city area"
              autoComplete="street-address"
            />
          </div>
        </div>

        <div>
          <label htmlFor="listing-type" className={labelClass}>
            Listing type
          </label>
          <select
            id="listing-type"
            name="listingType"
            className={`${inputClass} ${inputDisabledClass}`}
            value={
              isBookListingTypeCategory
                ? "book"
                : isHireListingTypeCategory
                  ? "hire"
                  : listingType
            }
            onChange={(e) => setListingType(e.target.value as ListingType | "")}
            disabled={
              !selectedCategory ||
              isBookListingTypeCategory ||
              isHireListingTypeCategory
            }
          >
            <option value="">
              {!selectedCategory
                ? "Choose a category first"
                : isBookListingTypeCategory
                  ? "This category is booked"
                  : isHireListingTypeCategory
                    ? "Medical transport listings are hire"
                    : "Select listing type"}
            </option>
            <option value="sale">Sale</option>
            <option value="hire">Hire</option>
            <option value="book" disabled>
              Book
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="stock" className={labelClass}>
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            step={1}
            value={saleOrHireCommerce ? stock : ""}
            onChange={(e) => setStock(e.target.value)}
            disabled={!saleOrHireCommerce}
            className={`${inputClass} ${inputDisabledClass}`}
            placeholder={
              effectiveListingType === "sale"
                ? "Enter stock quantity"
                : effectiveListingType === "hire"
                  ? "Optional — units available to hire"
                  : "Available for sale and hire listings"
            }
          />
        </div>

        <div>
          <label htmlFor="price" className={labelClass}>
            Price (NGN)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={0.01}
            value={saleOrHireCommerce ? price : ""}
            onChange={(e) => setPrice(e.target.value)}
            disabled={!saleOrHireCommerce}
            className={`${inputClass} ${inputDisabledClass}`}
            placeholder={
              effectiveListingType === "sale"
                ? "Enter price in naira"
                : effectiveListingType === "hire"
                  ? "Optional — hire rate in naira"
                  : "Available for sale and hire listings"
            }
          />
        </div>

        {effectiveListingType === "hire" ? (
          <div>
            <label htmlFor="pricing-period" className={labelClass}>
              Pricing period
            </label>
            <select
              id="pricing-period"
              name="pricingPeriod"
              className={`${inputClass} ${inputDisabledClass}`}
              value={pricingPeriod}
              onChange={(e) =>
                setPricingPeriod(
                  e.target.value === ""
                    ? ""
                    : (e.target.value as PricingPeriod),
                )
              }
              required
            >
              <option value="">Select period</option>
              {PRICING_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {formatPricingPeriodLabel(p)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-600">
              How the hire price applies (e.g. per hour, per day).
            </p>
          </div>
        ) : null}

        {effectiveListingType === "hire" ? (
          <div className="space-y-4 rounded-2xl border border-blue-100/80 bg-white/60 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900/80">
              Return schedule
            </h2>
            <HireReturnWindowFields
              value={hireReturnWindow}
              onChange={setHireReturnWindow}
              labelClass={labelClass}
              inputClass={inputClass}
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="service-title" className={labelClass}>
            Title
          </label>
          <input
            id="service-title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. Event medical standby — 2 ambulances"
          />
        </div>

        <div>
          <label htmlFor="service-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="service-description"
            name="description"
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-y`}
            placeholder="Coverage area, crew size, vehicle types, pricing notes…"
          />
        </div>

        <div>
          <span className={labelClass}>Photos</span>
          <p className="mt-1 text-xs text-slate-600">
            Images only (JPEG, PNG, WebP, etc.). Up to 10 files, 5MB each.
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const list = e.target.files;
              setFileList(list ? Array.from(list) : []);
            }}
            className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-blue-800 file:to-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white file:shadow-md file:shadow-blue-900/30 hover:file:opacity-95"
          />
        </div>

        {submitError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm">
            {submitError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={
            submitting ||
            loadingCategories ||
            !!loadError ||
            !categorySlug ||
            !departmentSlug ||
            (!isBookListingTypeCategory &&
              !isHireListingTypeCategory &&
              !listingType) ||
            (effectiveListingType === "sale" &&
              (!stock.trim() ||
                !Number.isInteger(Number(stock)) ||
                Number(stock) < 0)) ||
            (effectiveListingType === "hire" &&
              !!stock.trim() &&
              (!Number.isInteger(Number(stock)) || Number(stock) < 0)) ||
            (effectiveListingType === "sale" &&
              (!price.trim() ||
                !Number.isFinite(Number(price)) ||
                Number(price) < 0)) ||
            (effectiveListingType === "hire" &&
              !!price.trim() &&
              (!Number.isFinite(Number(price)) || Number(price) < 0)) ||
            (effectiveListingType === "hire" &&
              (!pricingPeriod || !isPricingPeriod(pricingPeriod)))
          }
          className="w-full rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-700 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {submitting ? "Publishing…" : "Publish service"}
        </button>
      </form>
    </div>
  );
}
