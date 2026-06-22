import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/women")({
  head: () => ({
    meta: [
      { title: "Women's Fashion — PAUL BILLIONS" },
      { name: "description", content: "Premium women's clothing, jewelry and accessories in Nigeria." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Women"
      title="Crafted for the woman who leads."
      description="Evening, ready-to-wear, jewellery and accessories — the complete women's edit is on its way."
    />
  ),
});
