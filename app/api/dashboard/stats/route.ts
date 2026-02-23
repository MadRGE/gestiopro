import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-api";

export async function GET() {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId } = result;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const [ventasHoy, ventasAyer, productosActivos, recientes] =
      await Promise.all([
        prisma.venta.aggregate({
          _sum: { total: true },
          _count: true,
          where: {
            negocioId,
            estado: "COMPLETADA",
            creadoEl: { gte: todayStart },
          },
        }),
        prisma.venta.aggregate({
          _sum: { total: true },
          _count: true,
          where: {
            negocioId,
            estado: "COMPLETADA",
            creadoEl: { gte: yesterdayStart, lt: todayStart },
          },
        }),
        prisma.producto.count({
          where: { negocioId, activo: true },
        }),
        prisma.venta.findMany({
          where: { negocioId, estado: "COMPLETADA" },
          orderBy: { creadoEl: "desc" },
          take: 5,
          include: { vendedor: { select: { nombre: true } } },
        }),
      ]);

    const alertasStock = await prisma.$queryRaw<
      Array<{ id: string; nombre: string; stock: number; stock_minimo: number }>
    >`
      SELECT id, nombre, stock, stock_minimo
      FROM productos
      WHERE negocio_id = ${negocioId}
        AND activo = true
        AND stock_minimo > 0
        AND stock <= stock_minimo
      ORDER BY stock ASC
      LIMIT 5
    `;

    const stockBajoCount = await prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*)::bigint as count
      FROM productos
      WHERE negocio_id = ${negocioId}
        AND activo = true
        AND stock_minimo > 0
        AND stock <= stock_minimo
    `;

    return NextResponse.json({
      ventasHoy: {
        total: Number(ventasHoy._sum.total ?? 0),
        cantidad: ventasHoy._count,
      },
      ventasAyer: {
        total: Number(ventasAyer._sum.total ?? 0),
        cantidad: ventasAyer._count,
      },
      productosActivos,
      stockBajo: Number(stockBajoCount[0]?.count ?? 0),
      recientes: recientes.map((v) => ({
        id: v.id,
        numero: v.numero,
        total: Number(v.total),
        metodoPago: v.metodoPago,
        creadoEl: v.creadoEl,
        vendedor: v.vendedor,
      })),
      alertasStock: alertasStock.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        stock: p.stock,
        stockMinimo: p.stock_minimo,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
