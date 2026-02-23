import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";

export async function GET() {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      include: { rubro: { select: { nombre: true } } },
    });

    if (!negocio) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(negocio);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const body = await req.json();
    const { nombre, direccion, telefono, cuit, condicionFiscal } = body;

    const negocio = await prisma.negocio.update({
      where: { id: negocioId },
      data: { nombre, direccion, telefono, cuit, condicionFiscal },
    });

    return NextResponse.json(negocio);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
