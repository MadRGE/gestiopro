"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { EmpleadoTable } from "./empleado-table";
import { EmpleadoCards } from "./empleado-cards";
import { EmpleadoDialog } from "./empleado-dialog";
import { EmpleadoDeleteDialog } from "./empleado-delete-dialog";

interface Empleado {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  creadoEl: string;
}

export function EmpleadosClient() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  const fetchEmpleados = useCallback(async () => {
    try {
      const res = await fetch("/api/empleados");
      if (!res.ok) throw new Error("Error al cargar empleados");
      const data = await res.json();
      setEmpleados(data);
    } catch {
      toast.error("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  function handleCreate() {
    setSelectedEmpleado(null);
    setDialogOpen(true);
  }

  function handleEdit(empleado: Empleado) {
    setSelectedEmpleado(empleado);
    setDialogOpen(true);
  }

  function handleDelete(empleado: Empleado) {
    setSelectedEmpleado(empleado);
    setDeleteDialogOpen(true);
  }

  function handleSuccess() {
    toast.success(selectedEmpleado ? "Empleado actualizado" : "Empleado creado");
    fetchEmpleados();
  }

  function handleDeleteSuccess() {
    toast.success("Empleado eliminado");
    fetchEmpleados();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Skeleton className="h-10 w-40" />
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
      <div className="flex items-center justify-end">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo empleado
        </Button>
      </div>

      {empleados.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No hay empleados registrados.
        </p>
      ) : (
        <>
          <EmpleadoTable
            empleados={empleados}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <EmpleadoCards
            empleados={empleados}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      <EmpleadoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        empleado={selectedEmpleado}
        onSuccess={handleSuccess}
      />

      <EmpleadoDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        empleado={selectedEmpleado}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
