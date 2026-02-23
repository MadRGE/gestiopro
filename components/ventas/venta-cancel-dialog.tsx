"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Venta {
  id: string;
  numero: number;
  total: number | string;
}

interface VentaCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: Venta | null;
  onSuccess: () => void;
}

export function VentaCancelDialog({
  open,
  onOpenChange,
  venta,
  onSuccess,
}: VentaCancelDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!venta) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ventas/${venta.id}`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cancelar venta");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cancelar venta"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar venta #{venta?.numero}</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción cancelará la venta y restaurará el stock de los productos.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Volver</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={loading}
            onClick={handleCancel}
          >
            {loading ? "Cancelando..." : "Cancelar venta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
