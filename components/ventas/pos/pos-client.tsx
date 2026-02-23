"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PosProductSearch } from "./pos-product-search";
import { PosCart, type CartItem } from "./pos-cart";

interface Producto {
  id: string;
  nombre: string;
  precioVenta: number | string;
  stock: number;
}

export function PosClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [clienteId, setClienteId] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  function handleAddProduct(producto: Producto) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productoId === producto.id);
      if (existing) {
        if (existing.cantidad >= producto.stock) {
          toast.error("Stock insuficiente");
          return prev;
        }
        return prev.map((i) =>
          i.productoId === producto.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precioVenta),
          cantidad: 1,
          stockDisponible: producto.stock,
        },
      ];
    });
  }

  function handleUpdateCantidad(productoId: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.productoId !== productoId) return i;
          const newCantidad = i.cantidad + delta;
          if (newCantidad <= 0) return null;
          if (newCantidad > i.stockDisponible) {
            toast.error("Stock insuficiente");
            return i;
          }
          return { ...i, cantidad: newCantidad };
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function handleRemove(productoId: string) {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }

  async function handleSubmit() {
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productoId: i.productoId,
            cantidad: i.cantidad,
            precio: i.precio,
          })),
          metodoPago,
          clienteId: clienteId || null,
          descuento: descuento || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear venta");
      }

      const venta = await res.json();
      toast.success("Venta registrada exitosamente");
      router.push(`/dashboard/ventas/${venta.id}/ticket`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear venta"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="rounded-lg border p-4">
        <PosProductSearch onAdd={handleAddProduct} />
      </div>
      <div className="rounded-lg border p-4">
        <PosCart
          items={items}
          metodoPago={metodoPago}
          clienteId={clienteId}
          descuento={descuento}
          submitting={submitting}
          onUpdateCantidad={handleUpdateCantidad}
          onRemove={handleRemove}
          onMetodoPagoChange={setMetodoPago}
          onClienteChange={setClienteId}
          onDescuentoChange={setDescuento}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
