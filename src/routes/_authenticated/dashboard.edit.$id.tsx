import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/ProductForm";

export const Route = createFileRoute("/_authenticated/dashboard/edit/$id")({
  component: ({ params }) => <ProductForm mode="edit" productId={params.id} />,
});
