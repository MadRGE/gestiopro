import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";
import bcrypt from "bcryptjs";
import { empleadoCreateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId, rol } = result;

    const denied = requireRole(rol, "DUENIO");
    if (denied) return denied;

    const usuarios = await prisma.usuario.findMany({
      where: { negocioId },
      select: { id: true, nombre: true, email: true, rol: true, creadoEl: true },
      orderBy: { creadoEl: "desc" },
    });

    return NextResponse.json(usuarios);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener empleados" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId, rol } = result;

    const denied = requireRole(rol, "DUENIO");
    if (denied) return denied;

    const body = await req.json();
    const parsed = empleadoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { nombre, email, password } = parsed.data;

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol: "EMPLEADO",
        negocioId,
      },
      select: { id: true, nombre: true, email: true, rol: true, creadoEl: true },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear empleado" },
      { status: 500 }
    );
  }
}
