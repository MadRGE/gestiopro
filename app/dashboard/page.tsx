"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { useRubro } from "@/components/providers/rubro-provider";

interface DashboardStats {
  ventasHoy: { total: number; cantidad: number };
  ventasAyer: { total: number; cantidad: number };
  productosActivos: number;
  stockBajo: number;
  recientes: Array<{
    id: string;
    numero: number;
    total: number;
    metodoPago: string;
    creadoEl: string;
    vendedor: { nombre: string };
  }>;
  alertasStock: Array<{
    id: string;
    nombre: string;
    stock: number;
    stockMinimo: number;
  }>;
}

export default function DashboardPage() {
  const { labels } = useRubro();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (data?.ventasHoy) setStats(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tu negocio del día de hoy.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[300px] rounded-xl lg:col-span-2" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  const ventaTrend =
    stats?.ventasAyer?.total && stats.ventasAyer.total > 0
      ? Number(
          (
            ((stats.ventasHoy.total - stats.ventasAyer.total) /
              stats.ventasAyer.total) *
            100
          ).toFixed(1)
        )
      : 0;

  const txTrend =
    stats?.ventasAyer?.cantidad && stats.ventasAyer.cantidad > 0
      ? Number(
          (
            ((stats.ventasHoy.cantidad - stats.ventasAyer.cantidad) /
              stats.ventasAyer.cantidad) *
            100
          ).toFixed(1)
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tu negocio del día de hoy.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={labels.ventasDelDia}
          value={formatCurrency(stats?.ventasHoy?.total ?? 0)}
          description="vs. ayer"
          icon={DollarSign}
          trend={
            ventaTrend !== 0
              ? { value: Math.abs(ventaTrend), isPositive: ventaTrend > 0 }
              : undefined
          }
        />
        <KpiCard
          title="Transacciones"
          value={String(stats?.ventasHoy?.cantidad ?? 0)}
          description="vs. ayer"
          icon={ShoppingCart}
          trend={
            txTrend !== 0
              ? { value: Math.abs(txTrend), isPositive: txTrend > 0 }
              : undefined
          }
        />
        <KpiCard
          title={`${labels.productos} activos`}
          value={String(stats?.productosActivos ?? 0)}
          description="en catálogo"
          icon={Package}
        />
        <KpiCard
          title={labels.stockBajo}
          value={String(stats?.stockBajo ?? 0)}
          description={`${labels.productos.toLowerCase()} por reponer`}
          icon={AlertTriangle}
          trend={
            stats && stats.stockBajo > 0
              ? { value: stats.stockBajo, isPositive: false }
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentSales ventas={stats?.recientes ?? []} />
        <StockAlerts productos={stats?.alertasStock ?? []} />
      </div>
    </div>
  );
}
