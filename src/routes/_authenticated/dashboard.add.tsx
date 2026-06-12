import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/ProductForm";

export const Route = createFileRoute("/_authenticated/dashboard/add")({
  component: () => <ProductForm mode="add" />,
});
