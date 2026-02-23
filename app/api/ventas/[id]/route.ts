import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;
    const { id } = await params;

    const venta = await prisma.venta.findFirst({
      where: { id, negocioId },
      include: {
        items: { include: { producto: { select: { nombre: true } } } },
        vendedor: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
      },
    });

    if (!venta) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(venta);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener venta" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const venta = await prisma.$transaction(async (tx) => {
      const existing = await tx.venta.findFirst({
        where: { id, negocioId },
        include: { items: true },
      });

      if (!existing) {
        throw new Error("Venta no encontrada");
      }

      if (existing.estado !== "COMPLETADA") {
        throw new Error("Solo se pueden cancelar ventas completadas");
      }

      // Restaurar stock de cada item
      for (const item of existing.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.cantidad } },
        });
      }

      // Cambiar estado a CANCELADA
      return tx.venta.update({
        where: { id },
        data: { estado: "CANCELADA" },
        include: {
          vendedor: { select: { nombre: true } },
          _count: { select: { items: true } },
        },
      });
    });

    return NextResponse.json(venta);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cancelar venta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
