import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";
import { clienteCreateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const search = req.nextUrl.searchParams.get("search") || "";
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.nextUrl.searchParams.get("limit")) || 20));

    const where = {
      negocioId,
      activo: true,
      ...(search
        ? { nombre: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        orderBy: { nombre: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cliente.count({ where }),
    ]);

    return NextResponse.json({
      clientes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const body = await req.json();
    const parsed = clienteCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { nombre, telefono, email } = parsed.data;

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        telefono,
        email,
        negocioId,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    );
  }
}
