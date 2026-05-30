import {
  AdminPageHeader,
  AdminPlaceholderPanel,
  AdminTableSkeleton,
} from "@/components/admin/AdminPlaceholderPanel";

export default function AdminCategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Manage service categories, departments, banners, and catalog notes."
      />

      <AdminTableSkeleton
        columns={["Name", "Slug", "Departments", "Managed", "Updated"]}
        rows={4}
      />

      <AdminPlaceholderPanel
        title="Category CMS"
        description="Category create and update APIs exist on the backend today but are not yet protected or wired to this UI."
        features={[
          "Edit thumbnails, banners, and category notes",
          "Add custom categories outside the code catalog",
          "Manage department names and ordering",
          "Lock down category mutations to admin-only access",
        ]}
      />
    </div>
  );
}
