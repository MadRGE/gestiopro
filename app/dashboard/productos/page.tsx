import { ProductosClient } from "@/components/productos/productos-client";

export default function ProductosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        <p className="text-muted-foreground">
          Gestioná el catálogo de productos de tu negocio.
        </p>
      </div>
      <ProductosClient />
    </div>
  );
}
