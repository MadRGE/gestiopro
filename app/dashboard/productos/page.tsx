"use client";

import { ProductosClient } from "@/components/productos/productos-client";
import { useRubro } from "@/components/providers/rubro-provider";

export default function ProductosPage() {
  const { labels } = useRubro();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{labels.productos}</h1>
        <p className="text-muted-foreground">
          Gestioná el catálogo de {labels.productos.toLowerCase()} de tu negocio.
        </p>
      </div>
      <ProductosClient />
    </div>
  );
}
