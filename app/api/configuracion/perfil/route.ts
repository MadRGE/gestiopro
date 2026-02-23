import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { session } = result;

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user!.id },
      select: { nombre: true, email: true, rol: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { session } = result;

    const body = await req.json();
    const { nombre, passwordActual, passwordNueva } = body;

    const updateData: { nombre: string; password?: string } = { nombre };

    if (passwordNueva) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: session.user!.id },
        select: { password: true },
      });

      if (!usuario?.password) {
        return NextResponse.json(
          { error: "No se puede cambiar la contraseña de este tipo de cuenta" },
          { status: 400 }
        );
      }

      const valid = await bcrypt.compare(passwordActual || "", usuario.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Contraseña actual incorrecta" },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(passwordNueva, 10);
    }

    await prisma.usuario.update({
      where: { id: session.user!.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
