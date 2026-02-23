"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface Venta {
  id: string;
  numero: number;
  total: number | string;
  metodoPago: string;
  estado: string;
  creadoEl: string;
  vendedor: { nombre: string };
  _count: { items: number };
}

interface VentaCardsProps {
  ventas: Venta[];
  onCancel: (venta: Venta) => void;
}

const metodoPagoLabel: Record<string, string> = {
  EFECTIVO: "Efectivo",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  TRANSFERENCIA: "Transferencia",
  QR: "QR",
};

const estadoBadgeVariant: Record<string, "default" | "destructive" | "secondary"> = {
  COMPLETADA: "default",
  CANCELADA: "destructive",
  PENDIENTE: "secondary",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function VentaCards({ ventas, onCancel }: VentaCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {ventas.map((venta) => (
        <Card key={venta.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">#{venta.numero}</p>
                <Badge
                  variant={estadoBadgeVariant[venta.estado] || "secondary"}
                  className="shrink-0"
                >
                  {venta.estado === "COMPLETADA"
                    ? "Completada"
                    : venta.estado === "CANCELADA"
                    ? "Cancelada"
                    : "Pendiente"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatCurrency(Number(venta.total))}
                </span>
                <span>{metodoPagoLabel[venta.metodoPago] || venta.metodoPago}</span>
                <span>{formatDate(venta.creadoEl)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {venta.vendedor.nombre} &middot; {venta._count.items} item(s)
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  window.open(
                    `/dashboard/ventas/${venta.id}/ticket`,
                    "_blank"
                  )
                }
              >
                <Printer className="h-4 w-4" />
              </Button>
              {venta.estado === "COMPLETADA" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onCancel(venta)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
