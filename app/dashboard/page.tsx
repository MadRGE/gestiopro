import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { StockAlerts } from "@/components/dashboard/stock-alerts";

export default function DashboardPage() {
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
          title="Ventas del día"
          value="$48.300"
          description="vs. ayer"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <KpiCard
          title="Transacciones"
          value="24"
          description="vs. ayer"
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
        />
        <KpiCard
          title="Productos activos"
          value="156"
          description="en catálogo"
          icon={Package}
        />
        <KpiCard
          title="Stock bajo"
          value="4"
          description="productos por reponer"
          icon={AlertTriangle}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentSales />
        <StockAlerts />
      </div>
    </div>
  );
}
