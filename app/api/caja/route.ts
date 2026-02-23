import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";
import { cajaAbrirSchema } from "@/lib/validations";

export async function GET() {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const sesion = await prisma.cajaSesion.findFirst({
      where: { negocioId, estado: "ABIERTA" },
      include: {
        movimientos: { orderBy: { creadoEl: "desc" } },
        usuario: { select: { nombre: true } },
      },
    });

    if (!sesion) {
      return NextResponse.json({ sesion: null, ventasEfectivo: 0 });
    }

    // Sum cash sales since session opened
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

    return NextResponse.json({ sesion, ventasEfectivo });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener estado de caja" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId, userId } = result;

    const body = await req.json();
    const parsed = cajaAbrirSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { montoInicial } = parsed.data;

    // Check no open session exists
    const existing = await prisma.cajaSesion.findFirst({
      where: { negocioId, estado: "ABIERTA" },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya hay una caja abierta" },
        { status: 400 }
      );
    }

    const sesion = await prisma.cajaSesion.create({
      data: {
        montoInicial: typeof montoInicial === "string" ? parseFloat(montoInicial) : montoInicial,
        negocioId,
        usuarioId: userId,
      },
      include: {
        usuario: { select: { nombre: true } },
        movimientos: true,
      },
    });

    return NextResponse.json(sesion, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al abrir caja" },
      { status: 500 }
    );
  }
}
