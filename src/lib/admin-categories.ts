import { API_PROXY_PREFIX } from "@/lib/api";

export type AdminCategoryDepartment = {
  name: string;
  slug: string;
  order: number;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  catalogManaged: boolean;
  departments: AdminCategoryDepartment[];
  thumbnailUrl?: string;
  bannerUrl?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

function adminCategoriesError(res: Response, data: { message?: string }): Error {
  if (res.status === 401) {
    return new Error("Sign in as an admin to manage categories.");
  }
  if (res.status === 403) {
    return new Error("Admin access required.");
  }
  return new Error(data.message ?? "Could not complete category request.");
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const res = await fetch(`${API_PROXY_PREFIX}/admin/categories`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    categories?: AdminCategory[];
    message?: string;
  };

  if (!res.ok || !Array.isArray(data.categories)) {
    throw adminCategoriesError(res, data);
  }

  return data.categories;
}

export type CreateAdminCategoryInput = {
  name: string;
  departments?: { name: string }[];
  thumbnailUrl?: string | null;
  bannerUrl?: string | null;
};

export async function createAdminCategory(
  input: CreateAdminCategoryInput,
): Promise<AdminCategory> {
  const res = await fetch(`${API_PROXY_PREFIX}/admin/categories`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as {
    category?: AdminCategory;
    message?: string;
  };

  if (!res.ok || !data.category) {
    throw adminCategoriesError(res, data);
  }

  return data.category;
}

export type UpdateAdminCategoryInput = {
  name?: string;
  addDepartments?: { name: string }[];
  updateDepartments?: { slug: string; name: string }[];
  thumbnailUrl?: string | null;
  bannerUrl?: string | null;
};

export async function updateAdminCategory(
  slug: string,
  input: UpdateAdminCategoryInput,
): Promise<AdminCategory> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/categories/${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const data = (await res.json()) as {
    category?: AdminCategory;
    message?: string;
  };

  if (res.status === 404) {
    throw new Error(data.message ?? "Category not found.");
  }
  if (!res.ok || !data.category) {
    throw adminCategoriesError(res, data);
  }

  return data.category;
}
