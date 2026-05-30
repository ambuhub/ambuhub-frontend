import { AdminPageHeader, AdminPlaceholderPanel } from "@/components/admin/AdminPlaceholderPanel";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Platform configuration and operational controls for Ambuhub administrators."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Platform",
            body: "Site name, support email, maintenance mode, and feature flags.",
          },
          {
            title: "Security",
            body: "Admin access policies, session settings, and audit logging.",
          },
          {
            title: "Notifications",
            body: "System notification templates and delivery preferences.",
          },
          {
            title: "Integrations",
            body: "Paystack, Cloudinary, email, and third-party service keys.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Coming soon
            </p>
          </article>
        ))}
      </div>

      <AdminPlaceholderPanel
        title="Admin settings"
        description="Configuration panels will be added here as platform controls are defined."
        features={[
          "Environment-aware read-only config preview",
          "Role-based access for additional admin users",
          "Webhook and payment provider status checks",
          "Data retention and backup policy notes",
        ]}
      />
    </div>
  );
}
