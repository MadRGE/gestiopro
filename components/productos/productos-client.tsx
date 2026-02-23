"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ProductoSearch } from "./producto-search";
import { ProductoTable } from "./producto-table";
import { ProductoCards } from "./producto-cards";
import { ProductoDialog } from "./producto-dialog";
import { ProductoDeleteDialog } from "./producto-delete-dialog";
import { ProductoEmptyState } from "./producto-empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";

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
  categoriaId: string | null;
  activo: boolean;
  categoria?: { nombre: string } | null;
}

interface Categoria {
  id: string;
  nombre: string;
}

export function ProductosClient() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  const fetchProductos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoriaFilter) params.set("categoriaId", categoriaFilter);
      params.set("page", String(page));
      params.set("limit", "20");
      const res = await fetch(`/api/productos?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProductos(data.productos);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [search, categoriaFilter, page]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategorias(data);
      })
      .catch(() => {});
  }, []);

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
    setPage(1);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 w-full max-w-lg">
          <div className="flex-1">
            <ProductoSearch value={search} onChange={handleSearchChange} />
          </div>
          {categorias.length > 0 && (
            <Select
              value={categoriaFilter || "all"}
              onValueChange={(v) => {
                setCategoriaFilter(v === "all" ? "" : v);
                setPage(1);
                setLoading(true);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {productos.length === 0 && !search && !categoriaFilter ? (
        <ProductoEmptyState onCreateClick={handleCreate} />
      ) : productos.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron productos.
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

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

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
