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
import { VentaFilters, type VentaFilterValues } from "./venta-filters";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface Venta {
  id: string;
  numero: number;
  total: number | string;
  metodoPago: string;
  estado: string;
  creadoEl: string;
  vendedor: { nombre: string };
  cliente?: { nombre: string } | null;
  _count: { items: number };
}

const EMPTY_FILTERS: VentaFilterValues = {
  desde: "",
  hasta: "",
  metodoPago: "",
  estado: "",
};

export function VentasClient() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<VentaFilterValues>(EMPTY_FILTERS);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const router = useRouter();

  const fetchVentas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (filters.desde) params.set("desde", filters.desde);
      if (filters.hasta) params.set("hasta", filters.hasta);
      if (filters.metodoPago) params.set("metodoPago", filters.metodoPago);
      if (filters.estado) params.set("estado", filters.estado);

      const res = await fetch(`/api/ventas?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar ventas");
      const data = await res.json();
      setVentas(data.ventas);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  function handleFilterChange(newFilters: VentaFilterValues) {
    setFilters(newFilters);
    setPage(1);
  }

  function handleCancel(venta: Venta) {
    setSelectedVenta(venta);
    setCancelDialogOpen(true);
  }

  function handleCancelSuccess() {
    toast.success("Venta cancelada. Stock restaurado.");
    fetchVentas();
  }

  if (loading && ventas.length === 0) {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <VentaFilters filters={filters} onFilterChange={handleFilterChange} />
        <Button onClick={() => router.push("/dashboard/ventas/nueva")} className="shrink-0">
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

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <VentaCancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        venta={selectedVenta}
        onSuccess={handleCancelSuccess}
      />
    </>
  );
}
