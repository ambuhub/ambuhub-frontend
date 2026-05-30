import {
  AdminPageHeader,
  AdminPlaceholderPanel,
  AdminTableSkeleton,
} from "@/components/admin/AdminPlaceholderPanel";

export default function AdminListingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Listings"
        description="Review and moderate marketplace listings from all service providers."
      />

      <AdminTableSkeleton
        columns={["Title", "Provider", "Category", "Type", "Status", "Updated"]}
        rows={6}
      />

      <AdminPlaceholderPanel
        title="Listing moderation"
        description="Admins will be able to review listings before they go live or take action on reported content."
        features={[
          "Browse all services with availability and stock filters",
          "Disable listings that violate platform policy",
          "View provider contact and location details",
          "Jump to public marketplace listing pages",
        ]}
      />
    </div>
  );
}
