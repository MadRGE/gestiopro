import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";
import { ventaCreateSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit")) || 20));
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");
    const metodoPago = searchParams.get("metodoPago");
    const estado = searchParams.get("estado");

    const where: Record<string, unknown> = { negocioId };

    if (desde || hasta) {
      const creadoEl: Record<string, Date> = {};
      if (desde) creadoEl.gte = new Date(desde);
      if (hasta) {
        const hastaDate = new Date(hasta);
        hastaDate.setHours(23, 59, 59, 999);
        creadoEl.lte = hastaDate;
      }
      where.creadoEl = creadoEl;
    }
    if (metodoPago) where.metodoPago = metodoPago;
    if (estado) where.estado = estado;

    const [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        where,
        include: {
          vendedor: { select: { nombre: true } },
          cliente: { select: { nombre: true } },
          _count: { select: { items: true } },
        },
        orderBy: { creadoEl: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.venta.count({ where }),
    ]);

    return NextResponse.json({
      ventas,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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
    const parsed = ventaCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { items, metodoPago, clienteId, descuento } = parsed.data;

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
      const descuentoNum = descuento ? Number(descuento) : 0;
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
