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

interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  creadoEl: string;
}

interface ClienteCardsProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function ClienteCards({ clientes, onEdit, onDelete }: ClienteCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {clientes.map((cliente) => (
        <Card key={cliente.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium truncate">{cliente.nombre}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {cliente.telefono && <span>{cliente.telefono}</span>}
                {cliente.email && <span className="truncate">{cliente.email}</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                Alta: {formatDate(cliente.creadoEl)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(cliente)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(cliente)}
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
