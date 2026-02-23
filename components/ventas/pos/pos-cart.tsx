"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus, X, Loader2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export interface CartItem {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stockDisponible: number;
}

interface ClienteOption {
  id: string;
  nombre: string;
}

interface PosCartProps {
  items: CartItem[];
  metodoPago: string;
  clienteId: string;
  descuento: number;
  submitting: boolean;
  onUpdateCantidad: (productoId: string, delta: number) => void;
  onRemove: (productoId: string) => void;
  onMetodoPagoChange: (value: string) => void;
  onClienteChange: (value: string) => void;
  onDescuentoChange: (value: number) => void;
  onSubmit: () => void;
}

export function PosCart({
  items,
  metodoPago,
  clienteId,
  descuento,
  submitting,
  onUpdateCantidad,
  onRemove,
  onMetodoPagoChange,
  onClienteChange,
  onDescuentoChange,
  onSubmit,
}: PosCartProps) {
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteResults, setClienteResults] = useState<ClienteOption[]>([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!clienteSearch.trim()) {
      setClienteResults([]);
      setShowClienteDropdown(false);
      return;
    }

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetch(`/api/clientes?search=${encodeURIComponent(clienteSearch)}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setClienteResults(data);
            setShowClienteDropdown(true);
          }
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(searchTimer.current);
  }, [clienteSearch]);

  function handleSelectCliente(c: ClienteOption) {
    onClienteChange(c.id);
    setClienteNombre(c.nombre);
    setClienteSearch("");
    setShowClienteDropdown(false);
  }

  function handleClearCliente() {
    onClienteChange("");
    setClienteNombre("");
    setClienteSearch("");
  }

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const total = Math.max(0, subtotal - descuento);

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
        {/* Client selector */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Cliente (opcional)</Label>
          {clienteNombre ? (
            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
              <span>{clienteNombre}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClearCliente}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowClienteDropdown(false), 200)}
                placeholder="Buscar cliente..."
                className="h-8 pl-7 text-sm"
              />
              {showClienteDropdown && clienteResults.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-32 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                  {clienteResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                      onMouseDown={() => handleSelectCliente(c)}
                    >
                      {c.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Discount */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Descuento</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={descuento || ""}
            onChange={(e) => onDescuentoChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="h-8 text-sm"
          />
        </div>

        {/* Totals */}
        {descuento > 0 && (
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-red-600">
              <span>Descuento</span>
              <span>-{formatCurrency(descuento)}</span>
            </div>
          </div>
        )}
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
