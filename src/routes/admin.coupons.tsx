import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/crud";

export const Route = createFileRoute("/admin/coupons")({ component: () => (
  <CrudPage
    title="Coupons & Discounts"
    table="coupons"
    fields={[
      { key: "code", label: "Code", required: true },
      { key: "kind", label: "Type", type: "select", options: ["percent", "fixed"] },
      { key: "value", label: "Value", type: "number", required: true },
      { key: "min_subtotal_kobo", label: "Min subtotal (kobo)", type: "number" },
      { key: "max_uses", label: "Max uses", type: "number" },
      { key: "starts_at", label: "Starts at", type: "datetime-local" },
      { key: "ends_at", label: "Ends at", type: "datetime-local" },
      { key: "is_active", label: "Active", type: "boolean" },
    ]}
    columns={["code", "kind", "value", "used_count", "is_active"]}
  />
)});
