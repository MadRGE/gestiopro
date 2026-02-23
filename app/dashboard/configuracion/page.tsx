import { ConfiguracionClient } from "@/components/configuracion/configuracion-client";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Administrá los datos de tu negocio y tu perfil.
        </p>
      </div>
      <ConfiguracionClient />
    </div>
  );
}
