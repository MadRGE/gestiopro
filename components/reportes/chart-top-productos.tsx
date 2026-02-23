"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  data: Array<{
    nombre: string;
    cantidadVendida: number;
    totalVendido: number;
  }>;
}

export function ChartTopProductos({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 5 productos</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Sin datos para el período seleccionado
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis
                dataKey="nombre"
                type="category"
                width={120}
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "cantidadVendida")
                    return [Number(value), "Cantidad"];
                  return [formatCurrency(Number(value)), "Total"];
                }}
              />
              <Bar
                dataKey="cantidadVendida"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
