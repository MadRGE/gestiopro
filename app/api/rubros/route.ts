import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rubros = await prisma.rubro.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(rubros);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener rubros" },
      { status: 500 }
    );
  }
}
