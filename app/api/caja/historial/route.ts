import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";

export async function GET(req: NextRequest) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.nextUrl.searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    const where = { negocioId, estado: "CERRADA" as const };

    const [sesiones, total] = await Promise.all([
      prisma.cajaSesion.findMany({
        where,
        orderBy: { cerradaEl: "desc" },
        skip,
        take: limit,
        include: {
          usuario: { select: { nombre: true } },
          movimientos: true,
        },
      }),
      prisma.cajaSesion.count({ where }),
    ]);

    const sesionesConResumen = await Promise.all(
      sesiones.map(async (s) => {
        const ventasAgg = await prisma.venta.aggregate({
          where: {
            negocioId,
            metodoPago: "EFECTIVO",
            estado: "COMPLETADA",
            creadoEl: { gte: s.abiertaEl, ...(s.cerradaEl ? { lte: s.cerradaEl } : {}) },
          },
          _sum: { total: true },
        });

        const ventasEfectivo = Number(ventasAgg._sum.total ?? 0);
        const ingresos = s.movimientos
          .filter((m) => m.tipo === "INGRESO")
          .reduce((sum, m) => sum + Number(m.monto), 0);
        const egresos = s.movimientos
          .filter((m) => m.tipo === "EGRESO")
          .reduce((sum, m) => sum + Number(m.monto), 0);

        const montoInicial = Number(s.montoInicial);
        const montoFinal = Number(s.montoFinal ?? 0);
        const esperado = montoInicial + ventasEfectivo + ingresos - egresos;
        const diferencia = montoFinal - esperado;

        return {
          id: s.id,
          abiertaEl: s.abiertaEl,
          cerradaEl: s.cerradaEl,
          usuario: s.usuario,
          montoInicial,
          montoFinal,
          ventasEfectivo,
          ingresos,
          egresos,
          esperado,
          diferencia,
        };
      })
    );

    return NextResponse.json({
      sesiones: sesionesConResumen,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener historial de caja" },
      { status: 500 }
    );
  }
}
