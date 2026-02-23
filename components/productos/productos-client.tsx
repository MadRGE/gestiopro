"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ProductoSearch } from "./producto-search";
import { ProductoTable } from "./producto-table";
import { ProductoCards } from "./producto-cards";
import { ProductoDialog } from "./producto-dialog";
import { ProductoDeleteDialog } from "./producto-delete-dialog";
import { ProductoEmptyState } from "./producto-empty-state";

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
  activo: boolean;
}

export function ProductosClient() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  const fetchProductos = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/productos${params}`);
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProductos(data);
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  function handleCreate() {
    setSelectedProducto(null);
    setDialogOpen(true);
  }

  function handleEdit(producto: Producto) {
    setSelectedProducto(producto);
    setDialogOpen(true);
  }

  function handleDelete(producto: Producto) {
    setSelectedProducto(producto);
    setDeleteDialogOpen(true);
  }

  function handleCreateSuccess() {
    toast.success(selectedProducto ? "Producto actualizado" : "Producto creado");
    fetchProductos();
  }

  function handleDeleteSuccess() {
    toast.success("Producto eliminado");
    fetchProductos();
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setLoading(true);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-full max-w-sm" />
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
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <ProductoSearch value={search} onChange={handleSearchChange} />
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {productos.length === 0 && !search ? (
        <ProductoEmptyState onCreateClick={handleCreate} />
      ) : productos.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron productos para &quot;{search}&quot;
        </p>
      ) : (
        <>
          <ProductoTable
            productos={productos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <ProductoCards
            productos={productos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      <ProductoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        producto={selectedProducto}
        onSuccess={handleCreateSuccess}
      />

      <ProductoDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        producto={selectedProducto}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
