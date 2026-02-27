import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";
import { proveedorUpdateSchema, validateBody } from "@/lib/validations";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId, rol } = result;

    const denied = requireRole(rol, "DUENIO");
    if (denied) return denied;

    const { id } = await params;

    const existing = await prisma.proveedor.findFirst({
      where: { id, negocioId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = validateBody(proveedorUpdateSchema, body);
    if (parsed.error) return parsed.error;

    const proveedor = await prisma.proveedor.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(proveedor);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar proveedor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId, rol } = result;

    const denied = requireRole(rol, "DUENIO");
    if (denied) return denied;

    const { id } = await params;

    const existing = await prisma.proveedor.findFirst({
      where: { id, negocioId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    await prisma.proveedor.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar proveedor" },
      { status: 500 }
    );
  }
}
