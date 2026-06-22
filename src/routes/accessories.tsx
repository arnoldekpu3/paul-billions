import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { title: "Accessories — PAUL BILLIONS" },
      { name: "description", content: "Luxury watches, bags, belts and jewelry from PAUL BILLIONS." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Accessories"
      title="The finishing touch."
      description="Watches, leather goods, jewellery and small leather goods — the dedicated edit is on its way."
    />
  ),
});
