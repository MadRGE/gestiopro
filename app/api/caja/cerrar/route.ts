import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";
import { cajaCerrarSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const body = await req.json();
    const parsed = cajaCerrarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { montoFinal } = parsed.data;

    const sesion = await prisma.cajaSesion.findFirst({
      where: { negocioId, estado: "ABIERTA" },
      include: { movimientos: true },
    });

    if (!sesion) {
      return NextResponse.json(
        { error: "No hay una caja abierta" },
        { status: 400 }
      );
    }

    // Calculate expected amount
    const ventasAgg = await prisma.venta.aggregate({
      where: {
        negocioId,
        metodoPago: "EFECTIVO",
        estado: "COMPLETADA",
        creadoEl: { gte: sesion.abiertaEl },
      },
      _sum: { total: true },
    });

    const ventasEfectivo = Number(ventasAgg._sum.total ?? 0);

    const ingresos = sesion.movimientos
      .filter((m) => m.tipo === "INGRESO")
      .reduce((sum, m) => sum + Number(m.monto), 0);

    const egresos = sesion.movimientos
      .filter((m) => m.tipo === "EGRESO")
      .reduce((sum, m) => sum + Number(m.monto), 0);

    const montoInicialNum = Number(sesion.montoInicial);
    const esperado = montoInicialNum + ventasEfectivo + ingresos - egresos;
    const montoFinalNum = typeof montoFinal === "string" ? parseFloat(montoFinal) : montoFinal;
    const diferencia = montoFinalNum - esperado;

    const updated = await prisma.cajaSesion.update({
      where: { id: sesion.id },
      data: {
        montoFinal: montoFinalNum,
        estado: "CERRADA",
        cerradaEl: new Date(),
      },
    });

    return NextResponse.json({
      sesion: updated,
      resumen: {
        montoInicial: montoInicialNum,
        ventasEfectivo,
        ingresos,
        egresos,
        esperado,
        montoFinal: montoFinalNum,
        diferencia,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error al cerrar caja" },
      { status: 500 }
    );
  }
}
