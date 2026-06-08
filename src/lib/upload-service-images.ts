import { API_PROXY_PREFIX } from "@/lib/api";

export async function uploadServiceImages(files: File[]): Promise<string[]> {
  const imageFiles = files.filter((f) => f.type.startsWith("image/"));
  if (imageFiles.length === 0) {
    return [];
  }

  const formData = new FormData();
  for (const file of imageFiles) {
    formData.append("images", file);
  }

  const res = await fetch(`${API_PROXY_PREFIX}/uploads/service-images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = (await res.json()) as { urls?: string[]; message?: string };

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sign in to upload images.");
    }
    if (res.status === 403) {
      throw new Error("You do not have permission to upload images.");
    }
    throw new Error(data.message ?? "Image upload failed.");
  }

  return data.urls ?? [];
}
