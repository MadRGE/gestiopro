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
  data: Array<{ fecha: string; total: number; cantidad: number }>;
}

function formatShortDate(fecha: string) {
  const [, month, day] = fecha.split("-");
  return `${day}/${month}`;
}

export function ChartVentasDiarias({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ventas por día</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Sin datos para el período seleccionado
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="fecha"
                tickFormatter={formatShortDate}
                className="text-xs"
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                className="text-xs"
                width={90}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Total"]}
                labelFormatter={(label) => formatShortDate(String(label))}
              />
              <Bar
                dataKey="total"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
