import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";

export async function GET() {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const ventas = await prisma.venta.findMany({
      where: { negocioId },
      include: {
        vendedor: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
        _count: { select: { items: true } },
      },
      orderBy: { creadoEl: "desc" },
    });

    return NextResponse.json(ventas);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { session, negocioId } = result;

    const body = await req.json();
    const { items, metodoPago, clienteId, descuento } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un item" },
        { status: 400 }
      );
    }

    const venta = await prisma.$transaction(async (tx) => {
      // Auto-numerar
      const ultima = await tx.venta.findFirst({
        where: { negocioId },
        orderBy: { numero: "desc" },
        select: { numero: true },
      });
      const numero = (ultima?.numero ?? 0) + 1;

      // Validar stock y preparar items
      const itemsData = [];
      let total = 0;

      for (const item of items) {
        const producto = await tx.producto.findFirst({
          where: { id: item.productoId, negocioId, activo: true },
        });

        if (!producto) {
          throw new Error(`Producto no encontrado: ${item.productoId}`);
        }

        if (producto.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, solicitado: ${item.cantidad}`
          );
        }

        const subtotal = Number(item.precio) * item.cantidad;
        total += subtotal;

        itemsData.push({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: item.precio,
          subtotal,
        });

        // Decrementar stock
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      // Apply discount
      const descuentoNum = descuento ? parseFloat(descuento) : 0;
      const totalFinal = Math.max(0, total - descuentoNum);

      // Crear venta con items
      return tx.venta.create({
        data: {
          numero,
          total: totalFinal,
          descuento: descuentoNum,
          metodoPago: metodoPago || "EFECTIVO",
          estado: "COMPLETADA",
          negocioId,
          vendedorId: session.user!.id!,
          clienteId: clienteId || null,
          items: { create: itemsData },
        },
        include: {
          items: { include: { producto: { select: { nombre: true } } } },
          vendedor: { select: { nombre: true } },
        },
      });
    });

    return NextResponse.json(venta, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear venta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
