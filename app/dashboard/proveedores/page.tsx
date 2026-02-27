"use client";

import { ProveedoresClient } from "@/components/proveedores/proveedores-client";

export default function ProveedoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
        <p className="text-muted-foreground">
          Gestioná los proveedores de tu negocio.
        </p>
      </div>
      <ProveedoresClient />
    </div>
  );
}
