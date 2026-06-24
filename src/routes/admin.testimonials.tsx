import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/crud";

export const Route = createFileRoute("/admin/testimonials")({ component: () => (
  <CrudPage
    title="Testimonials & Reviews"
    table="testimonials"
    fields={[
      { key: "author", label: "Author", required: true },
      { key: "body", label: "Review", type: "textarea", required: true },
      { key: "rating", label: "Rating (1-5)", type: "number" },
      { key: "is_approved", label: "Approved (publish)", type: "boolean" },
    ]}
    columns={["author", "rating", "is_approved"]}
  />
)});
