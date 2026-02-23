"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ClienteTable } from "./cliente-table";
import { ClienteCards } from "./cliente-cards";
import { ClienteDialog } from "./cliente-dialog";
import { ClienteDeleteDialog } from "./cliente-delete-dialog";

interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  creadoEl: string;
}

export function ClientesClient() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const fetchClientes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const qs = params.toString();
      const res = await fetch(`/api/clientes${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClientes(data);
    } catch {
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  function handleCreate() {
    setSelectedCliente(null);
    setDialogOpen(true);
  }

  function handleEdit(cliente: Cliente) {
    setSelectedCliente(cliente);
    setDialogOpen(true);
  }

  function handleDelete(cliente: Cliente) {
    setSelectedCliente(cliente);
    setDeleteDialogOpen(true);
  }

  function handleSuccess() {
    toast.success(selectedCliente ? "Cliente actualizado" : "Cliente creado");
    fetchClientes();
  }

  function handleDeleteSuccess() {
    toast.success("Cliente eliminado");
    fetchClientes();
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      {clientes.length === 0 && !search ? (
        <p className="py-8 text-center text-muted-foreground">
          No hay clientes registrados.
        </p>
      ) : clientes.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron clientes.
        </p>
      ) : (
        <>
          <ClienteTable
            clientes={clientes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <ClienteCards
            clientes={clientes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      <ClienteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cliente={selectedCliente}
        onSuccess={handleSuccess}
      />

      <ClienteDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cliente={selectedCliente}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
