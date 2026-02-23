"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export interface CartItem {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stockDisponible: number;
}

interface PosCartProps {
  items: CartItem[];
  metodoPago: string;
  submitting: boolean;
  onUpdateCantidad: (productoId: string, delta: number) => void;
  onRemove: (productoId: string) => void;
  onMetodoPagoChange: (value: string) => void;
  onSubmit: () => void;
}

export function PosCart({
  items,
  metodoPago,
  submitting,
  onUpdateCantidad,
  onRemove,
  onMetodoPagoChange,
  onSubmit,
}: PosCartProps) {
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold">
        Carrito {items.length > 0 && `(${items.length})`}
      </h2>

      {items.length === 0 ? (
        <p className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Agregá productos al carrito
        </p>
      ) : (
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-28rem)]">
          {items.map((item) => (
            <div
              key={item.productoId}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{item.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.precio)} c/u
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdateCantidad(item.productoId, -1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.cantidad}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={item.cantidad >= item.stockDisponible}
                  onClick={() => onUpdateCantidad(item.productoId, 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <p className="w-20 text-right text-sm font-medium">
                {formatCurrency(item.precio * item.cantidad)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(item.productoId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-4 border-t pt-4">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <Select value={metodoPago} onValueChange={onMetodoPagoChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Método de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EFECTIVO">Efectivo</SelectItem>
            <SelectItem value="DEBITO">Débito</SelectItem>
            <SelectItem value="CREDITO">Crédito</SelectItem>
            <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
            <SelectItem value="QR">QR</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="w-full"
          size="lg"
          disabled={items.length === 0 || submitting}
          onClick={onSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Confirmar venta"
          )}
        </Button>
      </div>
    </div>
  );
}
