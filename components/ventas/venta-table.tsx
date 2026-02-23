"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface Venta {
  id: string;
  numero: number;
  total: number | string;
  metodoPago: string;
  estado: string;
  creadoEl: string;
  vendedor: { nombre: string };
  _count: { items: number };
}

interface VentaTableProps {
  ventas: Venta[];
  onCancel: (venta: Venta) => void;
}

const metodoPagoLabel: Record<string, string> = {
  EFECTIVO: "Efectivo",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  TRANSFERENCIA: "Transferencia",
  QR: "QR",
};

const estadoBadgeVariant: Record<string, "default" | "destructive" | "secondary"> = {
  COMPLETADA: "default",
  CANCELADA: "destructive",
  PENDIENTE: "secondary",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function VentaTable({ ventas, onCancel }: VentaTableProps) {
  return (
    <div className="hidden lg:block rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.map((venta) => (
            <TableRow key={venta.id}>
              <TableCell className="font-medium">{venta.numero}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(Number(venta.total))}
              </TableCell>
              <TableCell>
                {metodoPagoLabel[venta.metodoPago] || venta.metodoPago}
              </TableCell>
              <TableCell>
                <Badge variant={estadoBadgeVariant[venta.estado] || "secondary"}>
                  {venta.estado === "COMPLETADA"
                    ? "Completada"
                    : venta.estado === "CANCELADA"
                    ? "Cancelada"
                    : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(venta.creadoEl)}</TableCell>
              <TableCell>{venta.vendedor.nombre}</TableCell>
              <TableCell>
                {venta.estado === "COMPLETADA" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onCancel(venta)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
