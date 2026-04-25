"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Department = { name: string; slug: string; order: number };
type ListingType = "sale" | "rent";
type ServiceCategoryRow = {
  id: string;
  name: string;
  slug: string;
  departments: Department[];
};
const PERSONNEL_CATEGORY_SLUG = "personnel";
const AMBULANCE_SERVICING_CATEGORY_SLUG = "ambulance-servicing";
const NULL_LISTING_TYPE_CATEGORY_SLUGS = new Set([
  PERSONNEL_CATEGORY_SLUG,
  AMBULANCE_SERVICING_CATEGORY_SLUG,
]);

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
  const isNullListingTypeCategory = selectedCategory
    ? NULL_LISTING_TYPE_CATEGORY_SLUGS.has(selectedCategory.slug)
    : false;

  useEffect(() => {
    setDepartmentSlug("");
    setListingType("");
    setStock("");
    setPrice("");
  }, [categorySlug]);

  useEffect(() => {
    if (listingType !== "sale") {
      setStock("");
      setPrice("");
    }
  }, [listingType]);

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
    if (!isNullListingTypeCategory && !listingType) {
      setSubmitError("Listing type is required for this category.");
      return;
    }
    if (listingType === "sale") {
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
          listingType: isNullListingTypeCategory ? null : listingType,
          stock: listingType === "sale" ? Number(stock) : null,
          price: listingType === "sale" ? Number(price) : null,
          photoUrls,
        }),
      });
      const createData = (await createRes.json()) as { message?: string };
      if (!createRes.ok) {
        throw new Error(createData.message ?? "Could not publish service");
      }

      router.push("/provider/listings");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Add service
      </h1>
      <p className="mt-2 text-foreground/70">
        List standby coverage, scheduled transport, personnel, or equipment for
        venues and organizers.
      </p>

      {loadError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {loadError}
        </p>
      ) : null}

      <form
        className="mt-8 space-y-6 rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div>
          <label
            htmlFor="service-category"
            className="block text-sm font-medium text-foreground"
          >
            Service category
          </label>
          <select
            id="service-category"
            name="category"
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
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
          <label
            htmlFor="department"
            className="block text-sm font-medium text-foreground"
          >
            Department (sub-category)
          </label>
          <select
            id="department"
            name="department"
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25 disabled:cursor-not-allowed disabled:bg-ambuhub-surface/50 disabled:text-foreground/60"
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

        <div>
          <label
            htmlFor="listing-type"
            className="block text-sm font-medium text-foreground"
          >
            Listing type
          </label>
          <select
            id="listing-type"
            name="listingType"
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25 disabled:cursor-not-allowed disabled:bg-ambuhub-surface/50 disabled:text-foreground/60"
            value={isNullListingTypeCategory ? "" : listingType}
            onChange={(e) => setListingType(e.target.value as ListingType | "")}
            disabled={!selectedCategory || isNullListingTypeCategory}
          >
            <option value="">
              {!selectedCategory
                ? "Choose a category first"
                : isNullListingTypeCategory
                  ? "Not applicable for this category"
                  : "Select listing type"}
            </option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-foreground"
          >
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            step={1}
            value={listingType === "sale" ? stock : ""}
            onChange={(e) => setStock(e.target.value)}
            disabled={listingType !== "sale"}
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25 disabled:cursor-not-allowed disabled:bg-ambuhub-surface/50 disabled:text-foreground/60"
            placeholder={
              listingType === "sale"
                ? "Enter stock quantity"
                : "Available only for sale listings"
            }
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-foreground"
          >
            Price (NGN)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={0.01}
            value={listingType === "sale" ? price : ""}
            onChange={(e) => setPrice(e.target.value)}
            disabled={listingType !== "sale"}
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25 disabled:cursor-not-allowed disabled:bg-ambuhub-surface/50 disabled:text-foreground/60"
            placeholder={
              listingType === "sale"
                ? "Enter price in naira"
                : "Available only for sale listings"
            }
          />
        </div>

        <div>
          <label
            htmlFor="service-title"
            className="block text-sm font-medium text-foreground"
          >
            Title
          </label>
          <input
            id="service-title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="e.g. Event medical standby — 2 ambulances"
          />
        </div>

        <div>
          <label
            htmlFor="service-description"
            className="block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="service-description"
            name="description"
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full resize-y rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="Coverage area, crew size, vehicle types, pricing notes…"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-foreground">
            Photos
          </span>
          <p className="mt-1 text-xs text-foreground/55">
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
            className="mt-3 block w-full text-sm text-foreground/70 file:mr-4 file:rounded-lg file:border-0 file:bg-ambuhub-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ambuhub-brand-dark"
          />
        </div>

        {submitError ? (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900">
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
            (!isNullListingTypeCategory && !listingType) ||
            (listingType === "sale" &&
              (!stock.trim() ||
                !Number.isInteger(Number(stock)) ||
                Number(stock) < 0)) ||
            (listingType === "sale" &&
              (!price.trim() ||
                !Number.isFinite(Number(price)) ||
                Number(price) < 0))
          }
          className="w-full rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Publishing…" : "Publish service"}
        </button>
      </form>
    </div>
  );
}
