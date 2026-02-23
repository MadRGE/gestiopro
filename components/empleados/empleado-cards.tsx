"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Empleado {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  creadoEl: string;
}

interface EmpleadoCardsProps {
  empleados: Empleado[];
  onEdit: (empleado: Empleado) => void;
  onDelete: (empleado: Empleado) => void;
}

const rolLabel: Record<string, string> = {
  ADMIN: "Admin",
  DUENIO: "Dueño",
  EMPLEADO: "Empleado",
};

const rolVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  DUENIO: "default",
  EMPLEADO: "secondary",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function EmpleadoCards({ empleados, onEdit, onDelete }: EmpleadoCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {empleados.map((empleado) => (
        <Card key={empleado.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{empleado.nombre}</p>
                <Badge
                  variant={rolVariant[empleado.rol] || "secondary"}
                  className="shrink-0"
                >
                  {rolLabel[empleado.rol] || empleado.rol}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{empleado.email}</span>
                <span>{formatDate(empleado.creadoEl)}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(empleado)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(empleado)}
                  className="text-destructive focus:text-destructive"
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
