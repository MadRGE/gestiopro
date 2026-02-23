import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentSales = [
  {
    id: 1,
    cliente: "Venta #001",
    total: "$12.450",
    metodo: "Efectivo",
    hora: "14:32",
  },
  {
    id: 2,
    cliente: "Venta #002",
    total: "$3.200",
    metodo: "Débito",
    hora: "14:15",
  },
  {
    id: 3,
    cliente: "Venta #003",
    total: "$8.900",
    metodo: "Transferencia",
    hora: "13:48",
  },
  {
    id: 4,
    cliente: "Venta #004",
    total: "$1.750",
    metodo: "Efectivo",
    hora: "13:20",
  },
  {
    id: 5,
    cliente: "Venta #005",
    total: "$22.100",
    metodo: "Crédito",
    hora: "12:55",
  },
];

export function RecentSales() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Últimas ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  #{sale.id}
                </div>
                <div>
                  <p className="text-sm font-medium">{sale.cliente}</p>
                  <p className="text-xs text-muted-foreground">{sale.hora}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  {sale.metodo}
                </Badge>
                <span className="text-sm font-semibold">{sale.total}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
