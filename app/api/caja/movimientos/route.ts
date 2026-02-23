import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";
import { cajaMovimientoSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const body = await req.json();
    const parsed = cajaMovimientoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { tipo, monto, descripcion } = parsed.data;

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
        monto: typeof monto === "string" ? parseFloat(monto) : monto,
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
