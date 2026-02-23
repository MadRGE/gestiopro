"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { Printer, ArrowLeft } from "lucide-react";

interface VentaTicket {
  id: string;
  numero: number;
  total: number | string;
  metodoPago: string;
  estado: string;
  creadoEl: string;
  vendedor: { nombre: string };
  items: Array<{
    id: string;
    cantidad: number;
    precio: number | string;
    subtotal: number | string;
    producto: { nombre: string };
  }>;
}

interface NegocioInfo {
  nombre: string;
  direccion: string | null;
  cuit: string | null;
}

const metodoPagoLabel: Record<string, string> = {
  EFECTIVO: "Efectivo",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  TRANSFERENCIA: "Transferencia",
  QR: "QR",
};

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const [venta, setVenta] = useState<VentaTicket | null>(null);
  const [negocio, setNegocio] = useState<NegocioInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/ventas/${params.id}`).then((r) => r.json()),
      fetch("/api/configuracion").then((r) => r.json()),
    ])
      .then(([v, n]) => {
        setVenta(v);
        setNegocio(n);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Skeleton className="h-[600px] w-[350px] rounded-xl" />
      </div>
    );
  }

  if (!venta || "error" in venta) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <p className="text-muted-foreground">Venta no encontrada</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    );
  }

  const fecha = new Date(venta.creadoEl).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ticket,
          #ticket * {
            visibility: visible;
          }
          #ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex justify-center p-4">
        <div className="w-full max-w-[350px]">
          <div className="no-print mb-4 flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>

          <div
            id="ticket"
            className="rounded-lg border bg-white p-6 font-mono text-sm text-black"
          >
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold">
                {negocio?.nombre ?? "Mi Negocio"}
              </h2>
              {negocio?.direccion && (
                <p className="text-xs">{negocio.direccion}</p>
              )}
              {negocio?.cuit && (
                <p className="text-xs">CUIT: {negocio.cuit}</p>
              )}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2" />

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Venta #</span>
                <span className="font-bold">{venta.numero}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha</span>
                <span>{fecha}</span>
              </div>
              <div className="flex justify-between">
                <span>Vendedor</span>
                <span>{venta.vendedor.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span>Pago</span>
                <span>
                  {metodoPagoLabel[venta.metodoPago] || venta.metodoPago}
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2" />

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1">Producto</th>
                  <th className="text-center py-1">Cant</th>
                  <th className="text-right py-1">Precio</th>
                  <th className="text-right py-1">Subt.</th>
                </tr>
              </thead>
              <tbody>
                {venta.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1 pr-1">{item.producto.nombre}</td>
                    <td className="text-center py-1">{item.cantidad}</td>
                    <td className="text-right py-1">
                      {formatCurrency(Number(item.precio))}
                    </td>
                    <td className="text-right py-1">
                      {formatCurrency(Number(item.subtotal))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-gray-400 my-2" />

            <div className="flex justify-between font-bold text-base">
              <span>TOTAL</span>
              <span>{formatCurrency(Number(venta.total))}</span>
            </div>

            <div className="border-t border-dashed border-gray-400 my-3" />

            <p className="text-center text-xs text-gray-500">
              Gracias por su compra
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
