import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";
import { proveedorCreateSchema, validateBody } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId, rol } = result;

    const denied = requireRole(rol, "DUENIO");
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit")) || 20));

    const where = {
      negocioId,
      activo: true,
      ...(search
        ? { nombre: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [proveedores, total] = await Promise.all([
      prisma.proveedor.findMany({
        where,
        orderBy: { creadoEl: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.proveedor.count({ where }),
    ]);

    return NextResponse.json({
      proveedores,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener proveedores" },
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
    const parsed = validateBody(proveedorCreateSchema, body);
    if (parsed.error) return parsed.error;

    const proveedor = await prisma.proveedor.create({
      data: {
        ...parsed.data,
        negocioId,
      },
    });

    return NextResponse.json(proveedor, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear proveedor" },
      { status: 500 }
    );
  }
}
