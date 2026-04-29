"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

type Department = { name: string; slug: string; order: number };
type ListingType = "sale" | "rent";
type ServiceCategoryRow = {
  id: string;
  name: string;
  slug: string;
  departments: Department[];
};

type MyService = {
  id: string;
  title: string;
  description: string;
  listingType: "sale" | "rent" | null;
  stock: number | null;
  price: number | null;
  departmentSlug: string;
  departmentName: string;
  category: { id: string; slug: string; name: string };
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
};

const PERSONNEL_CATEGORY_SLUG = "personnel";
const AMBULANCE_SERVICING_CATEGORY_SLUG = "ambulance-servicing";
const NULL_LISTING_TYPE_CATEGORY_SLUGS = new Set([
  PERSONNEL_CATEGORY_SLUG,
  AMBULANCE_SERVICING_CATEGORY_SLUG,
]);

export default function ProviderEditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [categories, setCategories] = useState<ServiceCategoryRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingService, setLoadingService] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
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

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function loadService() {
      setServiceError(null);
      setLoadingService(true);
      try {
        const res = await fetch(`${API_PROXY_PREFIX}/services/me/${id}`, {
          credentials: "include",
        });
        const data = (await res.json()) as { service?: MyService; message?: string };
        if (!res.ok) {
          throw new Error(data.message ?? "Could not load this listing.");
        }
        const s = data.service;
        if (!cancelled && s) {
          setTitle(s.title);
          setDescription(s.description);
          setCategorySlug(s.category.slug);
          setDepartmentSlug(s.departmentSlug);
          setListingType(s.listingType ?? "");
          setStock(s.stock != null ? String(s.stock) : "");
          setPrice(s.price != null ? String(s.price) : "");
          setExistingPhotoUrls(s.photoUrls ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setServiceError(
            e instanceof Error ? e.message : "Could not load listing.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingService(false);
        }
      }
    }
    void loadService();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug],
  );
  const isNullListingTypeCategory = selectedCategory
    ? NULL_LISTING_TYPE_CATEGORY_SLUGS.has(selectedCategory.slug)
    : false;

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
      let photoUrls = [...existingPhotoUrls];
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
        photoUrls = [...photoUrls, ...(uploadData.urls ?? [])];
      }

      const putRes = await fetch(`${API_PROXY_PREFIX}/services/${id}`, {
        method: "PUT",
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
      const putData = (await putRes.json()) as { message?: string };
      if (!putRes.ok) {
        throw new Error(putData.message ?? "Could not update listing");
      }

      router.push(`/provider/listings/${id}`);
      router.refresh();
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

  if (loadingService || loadingCategories) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-slate-200/80" />
        <div className="mt-8 h-72 animate-pulse rounded-3xl bg-slate-200/60" />
      </div>
    );
  }

  if (serviceError || loadError) {
    return (
      <div className="mx-auto max-w-lg">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {serviceError ?? loadError}
        </p>
        <Link
          href="/provider/listings"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/provider/listings/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to listing
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-5 shadow-xl shadow-blue-950/40 sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Update listing
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-blue-100/90 sm:text-base">
          Change details, photos, or pricing. Saved updates appear on the public
          category pages after a short refresh.
        </p>
      </div>

      <form
        className="mt-6 space-y-6 rounded-3xl border border-blue-100 bg-gradient-to-b from-white via-blue-50/40 to-cyan-50/50 p-6 shadow-lg shadow-blue-200/50 sm:p-8"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div>
          <label htmlFor="edit-service-category" className={labelClass}>
            Service category
          </label>
          <select
            id="edit-service-category"
            name="category"
            className={`${inputClass} ${inputDisabledClass}`}
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            disabled={!!loadError}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-department" className={labelClass}>
            Department (sub-category)
          </label>
          <select
            id="edit-department"
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

        <div>
          <label htmlFor="edit-listing-type" className={labelClass}>
            Listing type
          </label>
          <select
            id="edit-listing-type"
            name="listingType"
            className={`${inputClass} ${inputDisabledClass}`}
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
          <label htmlFor="edit-stock" className={labelClass}>
            Stock
          </label>
          <input
            id="edit-stock"
            name="stock"
            type="number"
            min={0}
            step={1}
            value={listingType === "sale" ? stock : ""}
            onChange={(e) => setStock(e.target.value)}
            disabled={listingType !== "sale"}
            className={`${inputClass} ${inputDisabledClass}`}
            placeholder={
              listingType === "sale"
                ? "Enter stock quantity"
                : "Available only for sale listings"
            }
          />
        </div>

        <div>
          <label htmlFor="edit-price" className={labelClass}>
            Price (NGN)
          </label>
          <input
            id="edit-price"
            name="price"
            type="number"
            min={0}
            step={0.01}
            value={listingType === "sale" ? price : ""}
            onChange={(e) => setPrice(e.target.value)}
            disabled={listingType !== "sale"}
            className={`${inputClass} ${inputDisabledClass}`}
            placeholder={
              listingType === "sale"
                ? "Enter price in naira"
                : "Available only for sale listings"
            }
          />
        </div>

        <div>
          <label htmlFor="edit-title" className={labelClass}>
            Title
          </label>
          <input
            id="edit-title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="edit-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="edit-description"
            name="description"
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div>
          <span className={labelClass}>Photos</span>
          <p className="mt-1 text-xs text-slate-600">
            {existingPhotoUrls.length > 0
              ? `${existingPhotoUrls.length} image(s) on this listing. Add more below; new images are appended.`
              : "No images yet. Upload images below."}
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
          className="w-full rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-700 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
