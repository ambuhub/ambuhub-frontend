import {
  AdminPageHeader,
  AdminPlaceholderPanel,
  AdminTableSkeleton,
} from "@/components/admin/AdminPlaceholderPanel";

export default function AdminReviewsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Reviews"
        description="Moderate customer reviews and maintain marketplace trust."
      />

      <AdminTableSkeleton
        columns={["Listing", "Author", "Rating", "Date", "Status"]}
        rows={5}
      />

      <AdminPlaceholderPanel
        title="Review moderation"
        description="Review content will be surfaced here for admin approval or removal."
        features={[
          "Filter reviews by rating, listing, or provider",
          "Hide or remove reviews that breach guidelines",
          "View linked order and receipt context",
          "Track review volume by category",
        ]}
      />
    </div>
  );
}
