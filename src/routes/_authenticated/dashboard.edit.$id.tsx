import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/ProductForm";

export const Route = createFileRoute("/_authenticated/dashboard/edit/$id")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  console.log("Edit product ID from route:", id);
  if (!id) return <div>Invalid product ID</div>;
  return <ProductForm mode="edit" productId={id} />;
}
