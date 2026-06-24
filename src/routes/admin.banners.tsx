import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/crud";

export const Route = createFileRoute("/admin/banners")({ component: () => (
  <CrudPage
    title="Homepage Banners"
    table="banners"
    fields={[
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Subtitle" },
      { key: "image_url", label: "Image", type: "image", bucket: "banners" },
      { key: "link", label: "Link" },
      { key: "position", label: "Position", type: "select", options: ["hero", "secondary", "footer"] },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_active", label: "Active", type: "boolean" },
    ]}
    columns={["title", "position", "sort_order", "is_active"]}
  />
)});
