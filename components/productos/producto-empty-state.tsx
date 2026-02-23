"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductoEmptyStateProps {
  onCreateClick: () => void;
}

export function ProductoEmptyState({ onCreateClick }: ProductoEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No hay productos</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Empezá agregando tu primer producto al catálogo.
      </p>
      <Button onClick={onCreateClick} className="mt-6">
        Crear producto
      </Button>
    </div>
  );
}
