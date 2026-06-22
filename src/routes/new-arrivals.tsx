import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — PAUL BILLIONS" },
      { name: "description", content: "The latest luxury fashion arrivals at PAUL BILLIONS." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="New Arrivals"
      title="Fresh from the atelier."
      description="The newest pieces are landing weekly. The dedicated arrivals page is on its way."
    />
  ),
});
