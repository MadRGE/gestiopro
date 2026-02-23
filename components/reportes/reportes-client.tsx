"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { generateCSV, downloadCSV } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ChartVentasDiarias } from "./chart-ventas-diarias";
import { ChartMetodosPago } from "./chart-metodos-pago";
import { ChartTopProductos } from "./chart-top-productos";

interface ReportesData {
  ventasPorDia: Array<{ fecha: string; total: number; cantidad: number }>;
  porMetodoPago: Array<{ metodo: string; total: number; cantidad: number }>;
  topProductos: Array<{
    nombre: string;
    cantidadVendida: number;
    totalVendido: number;
  }>;
  resumen: { total: number; cantidad: number; promedio: number };
}

export function ReportesClient() {
  const [dias, setDias] = useState("7");
  const [data, setData] = useState<ReportesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reportes?dias=${dias}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [dias]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[350px] rounded-xl" />
          <Skeleton className="h-[350px] rounded-xl" />
        </div>
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Select value={dias} onValueChange={setDias}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          disabled={loading || !data}
          onClick={() => {
            if (!data) return;
            const rows: string[][] = [];
            rows.push(["=== RESUMEN ==="]);
            rows.push(["Total vendido", formatCurrency(data.resumen.total)]);
            rows.push(["Transacciones", String(data.resumen.cantidad)]);
            rows.push(["Ticket promedio", formatCurrency(data.resumen.promedio)]);
            rows.push([]);
            rows.push(["=== VENTAS POR DÍA ==="]);
            rows.push(["Fecha", "Total", "Cantidad"]);
            data.ventasPorDia.forEach((v) =>
              rows.push([v.fecha, formatCurrency(v.total), String(v.cantidad)])
            );
            rows.push([]);
            rows.push(["=== POR MÉTODO DE PAGO ==="]);
            rows.push(["Método", "Total", "Cantidad"]);
            data.porMetodoPago.forEach((m) =>
              rows.push([m.metodo, formatCurrency(m.total), String(m.cantidad)])
            );
            rows.push([]);
            rows.push(["=== TOP PRODUCTOS ==="]);
            rows.push(["Producto", "Cantidad vendida", "Total vendido"]);
            data.topProductos.forEach((p) =>
              rows.push([p.nombre, String(p.cantidadVendida), formatCurrency(p.totalVendido)])
            );
            const csv = generateCSV(["Reporte de ventas"], rows);
            downloadCSV(`reporte-${dias}dias.csv`, csv);
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.resumen.total ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.resumen.cantidad ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.resumen.promedio ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartVentasDiarias data={data?.ventasPorDia ?? []} />
        <ChartMetodosPago data={data?.porMetodoPago ?? []} />
      </div>

      <ChartTopProductos data={data?.topProductos ?? []} />
    </div>
  );
}
