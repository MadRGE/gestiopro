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
import { formatCurrency } from "@/lib/formatters";

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

interface ProductoCardsProps {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
}

export function ProductoCards({ productos, onEdit, onDelete }: ProductoCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {productos.map((producto) => {
        const stockBajo =
          producto.stockMinimo > 0 && producto.stock <= producto.stockMinimo;

        return (
          <Card key={producto.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{producto.nombre}</p>
                  <Badge
                    variant={producto.activo ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {producto.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {formatCurrency(Number(producto.precioVenta))}
                  </span>
                  <span className={stockBajo ? "text-amber-500 font-medium" : ""}>
                    Stock: {producto.stock}
                    {producto.stockMinimo > 0 && `/${producto.stockMinimo}`}
                  </span>
                  {stockBajo && (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">
                      Bajo
                    </Badge>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(producto)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(producto)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
