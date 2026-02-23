import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoriaId = searchParams.get("categoriaId") || "";

    const productos = await prisma.producto.findMany({
      where: {
        negocioId,
        activo: true,
        ...(search
          ? { nombre: { contains: search, mode: "insensitive" as const } }
          : {}),
        ...(categoriaId ? { categoriaId } : {}),
      },
      include: {
        categoria: { select: { nombre: true } },
      },
      orderBy: { creadoEl: "desc" },
    });

    return NextResponse.json(productos);
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
    const { nombre, descripcion, codigoBarras, precioCompra, precioVenta, stock, stockMinimo, unidad, categoriaId } = body;

    if (!nombre || precioVenta === undefined || precioVenta === null) {
      return NextResponse.json(
        { error: "Nombre y precio de venta son obligatorios" },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        codigoBarras: codigoBarras || null,
        precioCompra: precioCompra || 0,
        precioVenta,
        stock: stock || 0,
        stockMinimo: stockMinimo || 0,
        unidad: unidad || "unidad",
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
