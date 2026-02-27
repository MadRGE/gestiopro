"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ProveedorTable } from "./proveedor-table";
import { ProveedorCards } from "./proveedor-cards";
import { ProveedorDialog } from "./proveedor-dialog";
import { ProveedorDeleteDialog } from "./proveedor-delete-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import type { Proveedor } from "./proveedor-table";

export function ProveedoresClient() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);

  const fetchProveedores = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "20");
      const res = await fetch(`/api/proveedores?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar proveedores");
      const data = await res.json();
      setProveedores(data.proveedores);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  function handleCreate() {
    setSelectedProveedor(null);
    setDialogOpen(true);
  }

  function handleEdit(proveedor: Proveedor) {
    setSelectedProveedor(proveedor);
    setDialogOpen(true);
  }

  function handleDelete(proveedor: Proveedor) {
    setSelectedProveedor(proveedor);
    setDeleteDialogOpen(true);
  }

  function handleSuccess() {
    toast.success(selectedProveedor ? "Proveedor actualizado" : "Proveedor creado");
    fetchProveedores();
  }

  function handleDeleteSuccess() {
    toast.success("Proveedor eliminado");
    fetchProveedores();
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
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar proveedor..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo proveedor
        </Button>
      </div>

      {proveedores.length === 0 && !search ? (
        <p className="py-8 text-center text-muted-foreground">
          No hay proveedores registrados.
        </p>
      ) : proveedores.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron proveedores.
        </p>
      ) : (
        <>
          <ProveedorTable
            proveedores={proveedores}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <ProveedorCards
            proveedores={proveedores}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <ProveedorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        proveedor={selectedProveedor}
        onSuccess={handleSuccess}
      />

      <ProveedorDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        proveedor={selectedProveedor}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
