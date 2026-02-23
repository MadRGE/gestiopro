import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";
import { clienteUpdateSchema } from "@/lib/validations";

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
    const body = await req.json();
    const parsed = clienteUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { nombre, telefono, email } = parsed.data;

    const existing = await prisma.cliente.findFirst({
      where: { id, negocioId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nombre,
        telefono,
        email,
      },
    });

    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId, rol } = result;

    const denied = requireRole(rol, "DUENIO");
    if (denied) return denied;

    const { id } = await params;

    const existing = await prisma.cliente.findFirst({
      where: { id, negocioId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    await prisma.cliente.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    );
  }
}
