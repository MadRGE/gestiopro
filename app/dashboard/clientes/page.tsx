"use client";

import { ClientesClient } from "@/components/clientes/clientes-client";
import { useRubro } from "@/components/providers/rubro-provider";

export default function ClientesPage() {
  const { labels } = useRubro();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{labels.clientes}</h1>
        <p className="text-muted-foreground">
          Gestioná la base de {labels.clientes.toLowerCase()} de tu negocio.
        </p>
      </div>
      <ClientesClient />
    </div>
  );
}
