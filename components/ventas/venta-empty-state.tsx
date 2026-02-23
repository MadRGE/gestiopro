"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function VentaEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No hay ventas</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Empezá registrando tu primera venta.
      </p>
      <Button
        onClick={() => router.push("/dashboard/ventas/nueva")}
        className="mt-6"
      >
        Nueva venta
      </Button>
    </div>
  );
}
