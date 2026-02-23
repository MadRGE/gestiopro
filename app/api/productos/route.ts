import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";
import { productoCreateSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoriaId = searchParams.get("categoriaId") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit")) || 20));

    const where = {
      negocioId,
      activo: true,
      ...(search
        ? { nombre: { contains: search, mode: "insensitive" as const } }
        : {}),
      ...(categoriaId ? { categoriaId } : {}),
    };

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          categoria: { select: { nombre: true } },
        },
        orderBy: { creadoEl: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.producto.count({ where }),
    ]);

    return NextResponse.json({
      productos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener productos" },
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
    const parsed = productoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { nombre, descripcion, codigoBarras, precioCompra, precioVenta, stock, stockMinimo, unidad, categoriaId } = parsed.data;

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        codigoBarras: codigoBarras || null,
        precioCompra,
        precioVenta,
        stock,
        stockMinimo,
        unidad,
        categoriaId: categoriaId || null,
        negocioId,
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
