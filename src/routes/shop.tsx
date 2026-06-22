import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — PAUL BILLIONS" },
      { name: "description", content: "Shop luxury clothing, watches, shoes and accessories from PAUL BILLIONS." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Shop"
      title="The full shop is being curated."
      description="We're preparing the complete product catalogue with filtering by price, category, size and colour. Sign up to the newsletter on our home page to be notified the moment it launches."
    />
  ),
});
