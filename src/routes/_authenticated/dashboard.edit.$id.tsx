import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "./dashboard.add";

export const Route = createFileRoute("/_authenticated/dashboard/edit/$id")({
  head: () => ({ meta: [{ title: "Edit product — Dukalink" }] }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  return <ProductForm mode="edit" productId={id} />;
}
