"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface CajaCerrarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalEsperado: number;
  onSuccess: () => void;
}

export function CajaCerrarDialog({
  open,
  onOpenChange,
  totalEsperado,
  onSuccess,
}: CajaCerrarDialogProps) {
  const [montoFinal, setMontoFinal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    diferencia: number;
    montoFinal: number;
    esperado: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setMontoFinal("");
      setError("");
      setResultado(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/caja/cerrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montoFinal }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cerrar caja");
      }

      const data = await res.json();
      setResultado(data.resumen);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar caja");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
    if (resultado) {
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cerrar caja</DialogTitle>
        </DialogHeader>

        {resultado ? (
          <div className="space-y-4">
            <div className="rounded-md border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total esperado</span>
                <span className="font-medium">
                  {formatCurrency(resultado.esperado)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Monto contado</span>
                <span className="font-medium">
                  {formatCurrency(resultado.montoFinal)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Diferencia</span>
                <span
                  className={
                    resultado.diferencia >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {resultado.diferencia >= 0 ? "+" : ""}
                  {formatCurrency(resultado.diferencia)}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Cerrar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="rounded-md border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total esperado</span>
                <span className="font-medium">
                  {formatCurrency(totalEsperado)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montoFinal">Monto contado en caja *</Label>
              <Input
                id="montoFinal"
                type="number"
                step="0.01"
                min="0"
                value={montoFinal}
                onChange={(e) => setMontoFinal(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} variant="destructive">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cerrar caja
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
