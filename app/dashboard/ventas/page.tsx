import { VentasClient } from "@/components/ventas/ventas-client";

export default function VentasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
        <p className="text-muted-foreground">
          Historial de ventas de tu negocio.
        </p>
      </div>
      <VentasClient />
    </div>
  );
}
