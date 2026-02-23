"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { VentaTable } from "./venta-table";
import { VentaCards } from "./venta-cards";
import { VentaCancelDialog } from "./venta-cancel-dialog";
import { VentaEmptyState } from "./venta-empty-state";

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

export function VentasClient() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const router = useRouter();

  const fetchVentas = useCallback(async () => {
    try {
      const res = await fetch("/api/ventas");
      if (!res.ok) throw new Error("Error al cargar ventas");
      const data = await res.json();
      setVentas(data);
    } catch {
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  function handleCancel(venta: Venta) {
    setSelectedVenta(venta);
    setCancelDialogOpen(true);
  }

  function handleCancelSuccess() {
    toast.success("Venta cancelada. Stock restaurado.");
    fetchVentas();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <Button onClick={() => router.push("/dashboard/ventas/nueva")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva venta
        </Button>
      </div>

      {ventas.length === 0 ? (
        <VentaEmptyState />
      ) : (
        <>
          <VentaTable ventas={ventas} onCancel={handleCancel} />
          <VentaCards ventas={ventas} onCancel={handleCancel} />
        </>
      )}

      <VentaCancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        venta={selectedVenta}
        onSuccess={handleCancelSuccess}
      />
    </>
  );
}
