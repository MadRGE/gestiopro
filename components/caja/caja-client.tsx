"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Lock, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatters";
import { CajaResumen } from "./caja-resumen";
import { CajaAbrirDialog } from "./caja-abrir-dialog";
import { CajaCerrarDialog } from "./caja-cerrar-dialog";
import { CajaMovimientoDialog } from "./caja-movimiento-dialog";

interface Movimiento {
  id: string;
  tipo: string;
  monto: number | string;
  descripcion: string | null;
  creadoEl: string;
}

interface CajaSesion {
  id: string;
  montoInicial: number | string;
  estado: string;
  abiertaEl: string;
  usuario: { nombre: string };
  movimientos: Movimiento[];
}

export function CajaClient() {
  const [sesion, setSesion] = useState<CajaSesion | null>(null);
  const [ventasEfectivo, setVentasEfectivo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [abrirOpen, setAbrirOpen] = useState(false);
  const [cerrarOpen, setCerrarOpen] = useState(false);
  const [movimientoOpen, setMovimientoOpen] = useState(false);

  const fetchCaja = useCallback(async () => {
    try {
      const res = await fetch("/api/caja");
      if (!res.ok) throw new Error("Error al cargar caja");
      const data = await res.json();
      setSesion(data.sesion);
      setVentasEfectivo(data.ventasEfectivo);
    } catch {
      toast.error("Error al cargar estado de caja");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaja();
  }, [fetchCaja]);

  function handleAbrirSuccess() {
    toast.success("Caja abierta exitosamente");
    fetchCaja();
  }

  function handleCerrarSuccess() {
    toast.success("Caja cerrada exitosamente");
    fetchCaja();
  }

  function handleMovimientoSuccess() {
    toast.success("Movimiento registrado");
    fetchCaja();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // No open session
  if (!sesion) {
    return (
      <>
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">Caja cerrada</h2>
            <p className="text-sm text-muted-foreground">
              Abrí la caja para comenzar a registrar movimientos.
            </p>
          </div>
          <Button onClick={() => setAbrirOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Abrir caja
          </Button>
        </div>

        <CajaAbrirDialog
          open={abrirOpen}
          onOpenChange={setAbrirOpen}
          onSuccess={handleAbrirSuccess}
        />
      </>
    );
  }

  // Open session - calculate totals
  const montoInicial = Number(sesion.montoInicial);
  const ingresos = sesion.movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((sum, m) => sum + Number(m.monto), 0);
  const egresos = sesion.movimientos
    .filter((m) => m.tipo === "EGRESO")
    .reduce((sum, m) => sum + Number(m.monto), 0);
  const totalEsperado = montoInicial + ventasEfectivo + ingresos - egresos;

  const fechaApertura = new Date(sesion.abiertaEl).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="default">Abierta</Badge>
          <span className="text-sm text-muted-foreground">
            {sesion.usuario.nombre} &middot; {fechaApertura}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setMovimientoOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Movimiento
          </Button>
          <Button variant="destructive" onClick={() => setCerrarOpen(true)}>
            <Lock className="mr-2 h-4 w-4" />
            Cerrar caja
          </Button>
        </div>
      </div>

      <CajaResumen
        montoInicial={montoInicial}
        ventasEfectivo={ventasEfectivo}
        ingresos={ingresos}
        egresos={egresos}
      />

      {sesion.movimientos.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Movimientos</h3>
          <div className="space-y-2">
            {sesion.movimientos.map((mov) => (
              <Card key={mov.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {mov.tipo === "INGRESO" ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {mov.tipo === "INGRESO" ? "Ingreso" : "Egreso"}
                      </p>
                      {mov.descripcion && (
                        <p className="text-xs text-muted-foreground">
                          {mov.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        mov.tipo === "INGRESO"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {mov.tipo === "INGRESO" ? "+" : "-"}
                      {formatCurrency(Number(mov.monto))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(mov.creadoEl).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <CajaCerrarDialog
        open={cerrarOpen}
        onOpenChange={setCerrarOpen}
        totalEsperado={totalEsperado}
        onSuccess={handleCerrarSuccess}
      />

      <CajaMovimientoDialog
        open={movimientoOpen}
        onOpenChange={setMovimientoOpen}
        onSuccess={handleMovimientoSuccess}
      />
    </>
  );
}
