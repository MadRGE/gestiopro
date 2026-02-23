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
import { Loader2 } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
}

interface ProductoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto: Producto | null;
  onSuccess: () => void;
}

export function ProductoDeleteDialog({
  open,
  onOpenChange,
  producto,
  onSuccess,
}: ProductoDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!producto) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar");
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      // Error handled by caller via toast
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará <strong>{producto?.nombre}</strong> del catálogo. Esta
            acción se puede revertir desde la base de datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
