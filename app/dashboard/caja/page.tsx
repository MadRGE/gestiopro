import { CajaClient } from "@/components/caja/caja-client";

export default function CajaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Caja</h1>
        <p className="text-muted-foreground">
          Gestioná la apertura, cierre y movimientos de caja.
        </p>
      </div>
      <CajaClient />
    </div>
  );
}
