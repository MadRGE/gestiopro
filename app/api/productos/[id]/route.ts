import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";
import { productoUpdateSchema } from "@/lib/validations";

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

    const existing = await prisma.producto.findFirst({
      where: { id, negocioId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = productoUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { nombre, descripcion, codigoBarras, precioCompra, precioVenta, stock, stockMinimo, unidad, categoriaId } = parsed.data;

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre,
        descripcion: descripcion || null,
        codigoBarras: codigoBarras || null,
        precioCompra,
        precioVenta,
        stock: stock ?? existing.stock,
        stockMinimo: stockMinimo ?? existing.stockMinimo,
        unidad,
        categoriaId: categoriaId !== undefined ? (categoriaId || null) : existing.categoriaId,
      },
    });

    return NextResponse.json(producto);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar producto" },
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

    const existing = await prisma.producto.findFirst({
      where: { id, negocioId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    await prisma.producto.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
