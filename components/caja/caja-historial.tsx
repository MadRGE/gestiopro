"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface SesionHistorial {
  id: string;
  abiertaEl: string;
  cerradaEl: string | null;
  usuario: { nombre: string };
  montoInicial: number;
  montoFinal: number;
  diferencia: number;
}

function formatFecha(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CajaHistorial() {
  const [sesiones, setSesiones] = useState<SesionHistorial[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchHistorial = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/caja/historial?page=${page}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSesiones(data.sesiones);
      setTotalPages(data.totalPages);
    } catch {
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sesiones.length === 0) {
    return (
      <div className="pt-4">
        <h3 className="font-semibold mb-2">Historial de cierres</h3>
        <p className="text-sm text-muted-foreground">No hay sesiones cerradas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Historial de cierres</h3>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Apertura</TableHead>
              <TableHead>Cierre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Monto inicial</TableHead>
              <TableHead className="text-right">Monto final</TableHead>
              <TableHead className="text-right">Diferencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sesiones.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{formatFecha(s.abiertaEl)}</TableCell>
                <TableCell>{s.cerradaEl ? formatFecha(s.cerradaEl) : "-"}</TableCell>
                <TableCell>{s.usuario.nombre}</TableCell>
                <TableCell className="text-right">{formatCurrency(s.montoInicial)}</TableCell>
                <TableCell className="text-right">{formatCurrency(s.montoFinal)}</TableCell>
                <TableCell className={`text-right font-medium ${s.diferencia >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {s.diferencia >= 0 ? "+" : ""}{formatCurrency(s.diferencia)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {sesiones.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{s.usuario.nombre}</span>
                <span className={`text-sm font-medium ${s.diferencia >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {s.diferencia >= 0 ? "+" : ""}{formatCurrency(s.diferencia)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Apertura: {formatFecha(s.abiertaEl)}</p>
                <p>Cierre: {s.cerradaEl ? formatFecha(s.cerradaEl) : "-"}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span>Inicial: {formatCurrency(s.montoInicial)}</span>
                <span>Final: {formatCurrency(s.montoFinal)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
