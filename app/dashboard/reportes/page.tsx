import { ReportesClient } from "@/components/reportes/reportes-client";

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">
          Análisis de ventas y rendimiento de tu negocio.
        </p>
      </div>
      <ReportesClient />
    </div>
  );
}
