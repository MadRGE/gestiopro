"use client";

import { VentasClient } from "@/components/ventas/ventas-client";
import { useRubro } from "@/components/providers/rubro-provider";

export default function VentasPage() {
  const { labels } = useRubro();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{labels.ventas}</h1>
        <p className="text-muted-foreground">
          Historial de {labels.ventas.toLowerCase()} de tu negocio.
        </p>
      </div>
      <VentasClient />
    </div>
  );
}
