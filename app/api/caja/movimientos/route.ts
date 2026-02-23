import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";

export async function POST(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const body = await req.json();
    const { tipo, monto, descripcion } = body;

    if (!tipo || !monto) {
      return NextResponse.json(
        { error: "Tipo y monto son requeridos" },
        { status: 400 }
      );
    }

    if (!["INGRESO", "EGRESO"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo debe ser INGRESO o EGRESO" },
        { status: 400 }
      );
    }

    const sesion = await prisma.cajaSesion.findFirst({
      where: { negocioId, estado: "ABIERTA" },
    });

    if (!sesion) {
      return NextResponse.json(
        { error: "No hay una caja abierta" },
        { status: 400 }
      );
    }

    const movimiento = await prisma.movimientoCaja.create({
      data: {
        cajaSesionId: sesion.id,
        tipo,
        monto: parseFloat(monto),
        descripcion: descripcion || null,
      },
    });

    return NextResponse.json(movimiento, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al registrar movimiento" },
      { status: 500 }
    );
  }
}
