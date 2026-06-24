import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/crud";

export const Route = createFileRoute("/admin/categories")({ component: () => (
  <CrudPage
    title="Categories"
    table="categories"
    fields={[
      { key: "name", label: "Name", required: true },
      { key: "slug", label: "Slug", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Image URL" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_active", label: "Active", type: "boolean" },
    ]}
    columns={["name", "slug", "sort_order", "is_active"]}
  />
)});
