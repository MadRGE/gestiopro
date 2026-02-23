"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface Producto {
  id: string;
  nombre: string;
  precioVenta: number | string;
  stock: number;
}

interface PosProductSearchProps {
  onAdd: (producto: Producto) => void;
}

export function PosProductSearch({ onAdd }: PosProductSearchProps) {
  const [search, setSearch] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`/api/productos${params}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProductos(data);
      } catch {
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Buscar productos</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : productos.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {search ? "No se encontraron productos" : "Escribí para buscar productos"}
        </p>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
          {productos.map((producto) => {
            const sinStock = producto.stock <= 0;
            return (
              <button
                key={producto.id}
                disabled={sinStock}
                onClick={() => onAdd(producto)}
                className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{producto.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(Number(producto.precioVenta))}
                    <span className="ml-2">
                      Stock: {producto.stock}
                    </span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={sinStock}
                  tabIndex={-1}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
