import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nombre, email, password, negocioNombre, rubroId } =
      await req.json();

    if (!nombre || !email || !password || !negocioNombre || !rubroId) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const negocio = await prisma.negocio.create({
      data: {
        nombre: negocioNombre,
        rubroId,
      },
    });

    const user = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol: "DUENIO",
        negocioId: negocio.id,
      },
    });

    return NextResponse.json(
      { user: { id: user.id, nombre: user.nombre, email: user.email } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
