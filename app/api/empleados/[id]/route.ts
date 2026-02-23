import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId, rol, userId } = result;

    const denied = requireRole(rol, "DUENIO");
    if (denied) return denied;

    const { id } = await params;

    const existing = await prisma.usuario.findFirst({
      where: { id, negocioId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { nombre, email, password, rol: nuevoRol } = body;

    if (id === userId && nuevoRol && nuevoRol !== existing.rol) {
      return NextResponse.json(
        { error: "No podés cambiar tu propio rol" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (nombre) data.nombre = nombre;
    if (email) data.email = email;
    if (nuevoRol) data.rol = nuevoRol;
    if (password) data.password = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, rol: true, creadoEl: true },
    });

    return NextResponse.json(usuario);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar empleado" },
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
    const { negocioId, rol, userId } = result;

    const denied = requireRole(rol, "DUENIO");
    if (denied) return denied;

    const { id } = await params;

    if (id === userId) {
      return NextResponse.json(
        { error: "No podés eliminarte a vos mismo" },
        { status: 400 }
      );
    }

    const existing = await prisma.usuario.findFirst({
      where: { id, negocioId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      );
    }

    await prisma.usuario.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar empleado" },
      { status: 500 }
    );
  }
}
