import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface ProductoStockBajo {
  id: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
}

export function StockAlerts({ productos }: { productos: ProductoStockBajo[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Stock bajo</CardTitle>
        <Badge variant="destructive" className="text-xs">
          {productos.length} alertas
        </Badge>
      </CardHeader>
      <CardContent>
        {productos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No hay alertas de stock
          </p>
        ) : (
          <div className="space-y-3">
            {productos.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{item.nombre}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-destructive">
                    {item.stock}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    /{item.stockMinimo}
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
