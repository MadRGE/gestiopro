import { CategoriasClient } from "@/components/categorias/categorias-client";

export default function CategoriasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground">
          Organizá tus productos por categorías.
        </p>
      </div>
      <CategoriasClient />
    </div>
  );
}
