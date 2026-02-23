import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";

interface VentaReciente {
  id: string;
  numero: number;
  total: number;
  metodoPago: string;
  creadoEl: string;
  vendedor: { nombre: string };
}

const metodoPagoLabel: Record<string, string> = {
  EFECTIVO: "Efectivo",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  TRANSFERENCIA: "Transferencia",
  QR: "QR",
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentSales({ ventas }: { ventas: VentaReciente[] }) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Últimas ventas</CardTitle>
      </CardHeader>
      <CardContent>
        {ventas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No hay ventas recientes
          </p>
        ) : (
          <div className="space-y-3">
            {ventas.map((venta) => (
              <div
                key={venta.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    #{venta.numero}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {venta.vendedor.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(venta.creadoEl)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {metodoPagoLabel[venta.metodoPago] || venta.metodoPago}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {formatCurrency(venta.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
