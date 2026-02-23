import { PosClient } from "@/components/ventas/pos/pos-client";

export default function NuevaVentaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva venta</h1>
        <p className="text-muted-foreground">
          Buscá productos y armá la venta.
        </p>
      </div>
      <PosClient />
    </div>
  );
}
