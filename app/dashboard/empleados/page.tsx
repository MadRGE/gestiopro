import { EmpleadosClient } from "@/components/empleados/empleados-client";

export default function EmpleadosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Empleados</h1>
        <p className="text-muted-foreground">
          Gestioná los usuarios y permisos de tu negocio.
        </p>
      </div>
      <EmpleadosClient />
    </div>
  );
}
