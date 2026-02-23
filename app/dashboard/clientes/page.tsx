import { ClientesClient } from "@/components/clientes/clientes-client";

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gestioná la base de clientes de tu negocio.
        </p>
      </div>
      <ClientesClient />
    </div>
  );
}
