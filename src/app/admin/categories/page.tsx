"use client";

import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  createAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type AdminCategory,
} from "@/lib/admin-categories";
import {
  FALLBACK_THUMB,
  isCloudinaryHost,
} from "@/lib/landing-service-categories";
import { uploadServiceImages } from "@/lib/upload-service-images";

type ImageFieldKey = "thumbnailUrl" | "bannerUrl";

function CategoryImagePreview({
  url,
  alt,
  variant,
}: {
  url?: string;
  alt: string;
  variant: "thumbnail" | "banner";
}) {
  const src = url?.trim() || FALLBACK_THUMB;
  const useNextImage = isCloudinaryHost(src) || src.startsWith("/");
  const className =
    variant === "banner"
      ? "h-28 w-full rounded-xl object-cover sm:h-32"
      : "h-24 w-24 rounded-xl object-cover";

  if (useNextImage) {
    return (
      <Image
        src={src}
        alt={alt}
        width={variant === "banner" ? 640 : 96}
        height={variant === "banner" ? 128 : 96}
        className={className}
        unoptimized={!isCloudinaryHost(src)}
      />
    );
  }

  return <img src={src} alt={alt} className={className} />;
}

function CategoryImageField({
  label,
  field,
  url,
  variant,
  busy,
  onUpload,
  onRemove,
}: {
  label: string;
  field: ImageFieldKey;
  url?: string;
  variant: "thumbnail" | "banner";
  busy: boolean;
  onUpload: (field: ImageFieldKey, file: File) => Promise<void>;
  onRemove: (field: ImageFieldKey) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImage = Boolean(url?.trim());

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div
        className={
          variant === "banner"
            ? "overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            : "inline-block overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
        }
      >
        <CategoryImagePreview url={url} alt={label} variant={variant} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) {
              void onUpload(field, file);
            }
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="h-4 w-4" aria-hidden />
          )}
          {hasImage ? "Replace" : "Upload"}
        </button>
        {hasImage ? (
          <button
            type="button"
            onClick={() => void onRemove(field)}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 transition hover:bg-rose-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

function formatUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function CategoryCard({
  category,
  onUpdated,
}: {
  category: AdminCategory;
  onUpdated: (next: AdminCategory) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [nameDraft, setNameDraft] = useState(category.name);
  const [deptDrafts, setDeptDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(category.departments.map((d) => [d.slug, d.name])),
  );
  const [newDeptName, setNewDeptName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingDeptSlug, setSavingDeptSlug] = useState<string | null>(null);
  const [addingDept, setAddingDept] = useState(false);
  const [imageBusyField, setImageBusyField] = useState<ImageFieldKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setNameDraft(category.name);
    setDeptDrafts(
      Object.fromEntries(category.departments.map((d) => [d.slug, d.name])),
    );
  }, [category]);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSaveCategoryName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }
    if (trimmed === category.name) {
      setSuccess("No changes to save.");
      return;
    }
    setSavingCategory(true);
    clearFeedback();
    try {
      const updated = await updateAdminCategory(category.slug, { name: trimmed });
      onUpdated(updated);
      setSuccess("Category name saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save category.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleSaveDepartment = async (deptSlug: string) => {
    const trimmed = deptDrafts[deptSlug]?.trim() ?? "";
    const original = category.departments.find((d) => d.slug === deptSlug)?.name;
    if (!trimmed) {
      setError("Department name is required.");
      return;
    }
    if (trimmed === original) {
      setSuccess("No changes to save.");
      return;
    }
    setSavingDeptSlug(deptSlug);
    clearFeedback();
    try {
      const updated = await updateAdminCategory(category.slug, {
        updateDepartments: [{ slug: deptSlug, name: trimmed }],
      });
      onUpdated(updated);
      setSuccess("Department name saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save department.");
    } finally {
      setSavingDeptSlug(null);
    }
  };

  const handleAddDepartment = async () => {
    const trimmed = newDeptName.trim();
    if (!trimmed) {
      setError("Enter a department name.");
      return;
    }
    setAddingDept(true);
    clearFeedback();
    try {
      const updated = await updateAdminCategory(category.slug, {
        addDepartments: [{ name: trimmed }],
      });
      onUpdated(updated);
      setNewDeptName("");
      setSuccess("Department added.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add department.");
    } finally {
      setAddingDept(false);
    }
  };

  const handleImageUpload = async (field: ImageFieldKey, file: File) => {
    setImageBusyField(field);
    clearFeedback();
    try {
      const urls = await uploadServiceImages([file]);
      const url = urls[0];
      if (!url) {
        throw new Error("Upload did not return a URL.");
      }
      const updated = await updateAdminCategory(category.slug, { [field]: url });
      onUpdated(updated);
      setSuccess(field === "thumbnailUrl" ? "Thumbnail saved." : "Banner saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload image.");
    } finally {
      setImageBusyField(null);
    }
  };

  const handleImageRemove = async (field: ImageFieldKey) => {
    setImageBusyField(field);
    clearFeedback();
    try {
      const updated = await updateAdminCategory(category.slug, { [field]: null });
      onUpdated(updated);
      setSuccess(field === "thumbnailUrl" ? "Thumbnail removed." : "Banner removed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove image.");
    } finally {
      setImageBusyField(null);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse category" : "Expand category"}
        >
          {expanded ? (
            <ChevronDown className="h-5 w-5" aria-hidden />
          ) : (
            <ChevronRight className="h-5 w-5" aria-hidden />
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 ring-1 ring-indigo-200/80">
              {category.slug}
            </span>
            {category.catalogManaged ? (
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                Catalog
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                Custom
              </span>
            )}
            <span className="text-xs text-slate-500">
              Updated {formatUpdated(category.updatedAt)}
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category name
              </span>
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => {
                  setNameDraft(e.target.value);
                  clearFeedback();
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/0 transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <button
              type="button"
              onClick={() => void handleSaveCategoryName()}
              disabled={savingCategory}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingCategory ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              Save name
            </button>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div className="grid gap-6 border-b border-slate-100 pb-4 sm:grid-cols-2">
            <CategoryImageField
              label="Thumbnail"
              field="thumbnailUrl"
              url={category.thumbnailUrl}
              variant="thumbnail"
              busy={imageBusyField === "thumbnailUrl"}
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
            />
            <CategoryImageField
              label="Banner"
              field="bannerUrl"
              url={category.bannerUrl}
              variant="banner"
              busy={imageBusyField === "bannerUrl"}
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Departments ({category.departments.length})
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Slugs stay fixed for existing listings; only display names change.
            </p>
          </div>

          {category.departments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
              No departments yet. Add one below.
            </p>
          ) : (
            <ul className="space-y-2">
              {category.departments.map((dept) => (
                <li
                  key={dept.slug}
                  className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:flex-row sm:items-end"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-xs font-medium text-slate-500">
                      {dept.slug}
                    </span>
                    <input
                      type="text"
                      value={deptDrafts[dept.slug] ?? dept.name}
                      onChange={(e) => {
                        setDeptDrafts((prev) => ({
                          ...prev,
                          [dept.slug]: e.target.value,
                        }));
                        clearFeedback();
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/0 transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSaveDepartment(dept.slug)}
                    disabled={savingDeptSlug === dept.slug}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-60"
                  >
                    {savingDeptSlug === dept.slug ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden />
                    )}
                    Save
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                New department
              </span>
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => {
                  setNewDeptName(e.target.value);
                  clearFeedback();
                }}
                placeholder="e.g. Ground Ambulance"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/0 transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <button
              type="button"
              onClick={() => void handleAddDepartment()}
              disabled={addingDept}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100 disabled:opacity-60"
            >
              {addingDept ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              Add department
            </button>
          </div>

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200/80">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200/80">
              {success}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDepts, setNewCategoryDepts] = useState("");
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await fetchAdminCategories();
      setCategories(rows);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleCategoryUpdated = (next: AdminCategory) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === next.id ? next : c)),
    );
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setCreateError("Category name is required.");
      setCreateSuccess(null);
      return;
    }
    const departments = newCategoryDepts
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((deptName) => ({ name: deptName }));

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      let thumbnailUrl: string | undefined;
      let bannerUrl: string | undefined;

      if (newThumbnailFile) {
        const urls = await uploadServiceImages([newThumbnailFile]);
        thumbnailUrl = urls[0];
        if (!thumbnailUrl) {
          throw new Error("Thumbnail upload did not return a URL.");
        }
      }
      if (newBannerFile) {
        const urls = await uploadServiceImages([newBannerFile]);
        bannerUrl = urls[0];
        if (!bannerUrl) {
          throw new Error("Banner upload did not return a URL.");
        }
      }

      const created = await createAdminCategory({
        name,
        departments: departments.length > 0 ? departments : undefined,
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
        ...(bannerUrl ? { bannerUrl } : {}),
      });
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setNewCategoryName("");
      setNewCategoryDepts("");
      setNewThumbnailFile(null);
      setNewBannerFile(null);
      setCreateSuccess(`Created “${created.name}”.`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Could not create category.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Manage service categories and their departments. Slugs are generated automatically and stay stable for listings."
      />

      <section className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Plus className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add category
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Optional: enter department names one per line. You can add more
                departments after saving.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category name
                </span>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setCreateError(null);
                    setCreateSuccess(null);
                  }}
                  placeholder="e.g. Medical transport"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-indigo-500/0 transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Departments (optional)
                </span>
                <textarea
                  value={newCategoryDepts}
                  onChange={(e) => {
                    setNewCategoryDepts(e.target.value);
                    setCreateError(null);
                    setCreateSuccess(null);
                  }}
                  rows={3}
                  placeholder={"Ground Ambulance\nAir Ambulance"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-indigo-500/0 transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>
              <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Thumbnail (optional)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setNewThumbnailFile(e.target.files?.[0] ?? null);
                      setCreateError(null);
                      setCreateSuccess(null);
                    }}
                    className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-900 hover:file:bg-indigo-100"
                  />
                  {newThumbnailFile ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Selected: {newThumbnailFile.name}
                    </p>
                  ) : null}
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Banner (optional)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setNewBannerFile(e.target.files?.[0] ?? null);
                      setCreateError(null);
                      setCreateSuccess(null);
                    }}
                    className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-900 hover:file:bg-indigo-100"
                  />
                  {newBannerFile ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Selected: {newBannerFile.name}
                    </p>
                  ) : null}
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleCreateCategory()}
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden />
                )}
                Create category
              </button>
            </div>

            {createError ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200/80">
                {createError}
              </p>
            ) : null}
            {createSuccess ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200/80">
                {createSuccess}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FolderTree className="h-5 w-5 text-indigo-600" aria-hidden />
            All categories
            {!loading ? (
              <span className="text-sm font-normal text-slate-500">
                ({categories.length})
              </span>
            ) : null}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden />
            Loading categories…
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm text-rose-800">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadCategories()}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : categories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            No categories yet. Create one above.
          </p>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onUpdated={handleCategoryUpdated}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
