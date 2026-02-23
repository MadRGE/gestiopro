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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigoBarras: string | null;
  precioCompra: number | string;
  precioVenta: number | string;
  stock: number;
  stockMinimo: number;
  unidad: string;
}

interface ProductoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto: Producto | null;
  onSuccess: () => void;
}

const UNIDADES = [
  { value: "unidad", label: "Unidad" },
  { value: "kg", label: "Kilogramo" },
  { value: "litro", label: "Litro" },
  { value: "metro", label: "Metro" },
  { value: "caja", label: "Caja" },
  { value: "pack", label: "Pack" },
  { value: "par", label: "Par" },
];

export function ProductoDialog({
  open,
  onOpenChange,
  producto,
  onSuccess,
}: ProductoDialogProps) {
  const isEditing = !!producto;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [unidad, setUnidad] = useState("unidad");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (producto) {
        setNombre(producto.nombre);
        setDescripcion(producto.descripcion || "");
        setCodigoBarras(producto.codigoBarras || "");
        setPrecioCompra(String(producto.precioCompra || ""));
        setPrecioVenta(String(producto.precioVenta || ""));
        setStock(String(producto.stock));
        setStockMinimo(String(producto.stockMinimo));
        setUnidad(producto.unidad);
      } else {
        setNombre("");
        setDescripcion("");
        setCodigoBarras("");
        setPrecioCompra("");
        setPrecioVenta("");
        setStock("");
        setStockMinimo("");
        setUnidad("unidad");
      }
      setError("");
    }
  }, [open, producto]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      nombre,
      descripcion: descripcion || null,
      codigoBarras: codigoBarras || null,
      precioCompra: precioCompra ? parseFloat(precioCompra) : 0,
      precioVenta: parseFloat(precioVenta),
      stock: stock ? parseInt(stock) : 0,
      stockMinimo: stockMinimo ? parseInt(stockMinimo) : 0,
      unidad,
    };

    try {
      const url = isEditing
        ? `/api/productos/${producto.id}`
        : "/api/productos";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigoBarras">Código de barras</Label>
            <Input
              id="codigoBarras"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              placeholder="EAN-13, UPC, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precioCompra">Precio compra</Label>
              <Input
                id="precioCompra"
                type="number"
                step="0.01"
                min="0"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioVenta">Precio venta *</Label>
              <Input
                id="precioVenta"
                type="number"
                step="0.01"
                min="0"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockMinimo">Stock mínimo</Label>
              <Input
                id="stockMinimo"
                type="number"
                min="0"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidad">Unidad</Label>
            <Select value={unidad} onValueChange={setUnidad}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIDADES.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
