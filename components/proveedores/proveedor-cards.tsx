"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Proveedor } from "./proveedor-table";

const CONDICION_LABELS: Record<string, string> = {
  CONTADO: "Contado",
  TREINTA_DIAS: "30 días",
  SESENTA_DIAS: "60 días",
  NOVENTA_DIAS: "90 días",
};

interface ProveedorCardsProps {
  proveedores: Proveedor[];
  onEdit: (proveedor: Proveedor) => void;
  onDelete: (proveedor: Proveedor) => void;
}

export function ProveedorCards({ proveedores, onEdit, onDelete }: ProveedorCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {proveedores.map((proveedor) => (
        <Card key={proveedor.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium truncate">{proveedor.nombre}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {proveedor.cuit && <span>{proveedor.cuit}</span>}
                <span>{CONDICION_LABELS[proveedor.condicionPago] || proveedor.condicionPago}</span>
              </div>
              {(proveedor.telefono || proveedor.email) && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {proveedor.telefono && <span>{proveedor.telefono}</span>}
                  {proveedor.email && <span className="truncate">{proveedor.email}</span>}
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(proveedor)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(proveedor)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
