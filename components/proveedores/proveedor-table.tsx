"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

const CONDICION_LABELS: Record<string, string> = {
  CONTADO: "Contado",
  TREINTA_DIAS: "30 días",
  SESENTA_DIAS: "60 días",
  NOVENTA_DIAS: "90 días",
};

export interface Proveedor {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  cuit: string | null;
  notas: string | null;
  nombreContacto: string | null;
  cargoContacto: string | null;
  condicionPago: string;
  cuentaBancaria: string | null;
  cbu: string | null;
  creadoEl: string;
}

interface ProveedorTableProps {
  proveedores: Proveedor[];
  onEdit: (proveedor: Proveedor) => void;
  onDelete: (proveedor: Proveedor) => void;
}

export function ProveedorTable({ proveedores, onEdit, onDelete }: ProveedorTableProps) {
  return (
    <div className="hidden lg:block rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>CUIT</TableHead>
            <TableHead>Condición pago</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {proveedores.map((proveedor) => (
            <TableRow key={proveedor.id}>
              <TableCell className="font-medium">{proveedor.nombre}</TableCell>
              <TableCell>{proveedor.nombreContacto || "-"}</TableCell>
              <TableCell>{proveedor.cuit || "-"}</TableCell>
              <TableCell>{CONDICION_LABELS[proveedor.condicionPago] || proveedor.condicionPago}</TableCell>
              <TableCell>{proveedor.telefono || "-"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
