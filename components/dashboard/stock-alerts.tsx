import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

const lowStockItems = [
  { nombre: "Coca-Cola 500ml", stock: 3, minimo: 10 },
  { nombre: "Pan lactal", stock: 2, minimo: 5 },
  { nombre: "Leche entera 1L", stock: 1, minimo: 8 },
  { nombre: "Galletitas surtidas", stock: 4, minimo: 10 },
];

export function StockAlerts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Stock bajo</CardTitle>
        <Badge variant="destructive" className="text-xs">
          {lowStockItems.length} alertas
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">{item.nombre}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-destructive">
                  {item.stock}
                </span>
                <span className="text-xs text-muted-foreground">
                  /{item.minimo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
