import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-api";

export async function GET(req: NextRequest) {
  try {
    const result = await getAuthSession();
    if ("error" in result) return result.error;
    const { negocioId, rol } = result;

    const denied = requireRole(rol, "DUENIO");
    if (denied) return denied;

    const dias = Number(req.nextUrl.searchParams.get("dias") ?? "7");
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);
    desde.setHours(0, 0, 0, 0);

    const ventasPorDia = await prisma.$queryRaw<
      Array<{ fecha: string; total: number; cantidad: bigint }>
    >`
      SELECT
        TO_CHAR(creado_el, 'YYYY-MM-DD') as fecha,
        COALESCE(SUM(total), 0)::float as total,
        COUNT(*)::bigint as cantidad
      FROM ventas
      WHERE negocio_id = ${negocioId}
        AND estado = 'COMPLETADA'
        AND creado_el >= ${desde}
      GROUP BY TO_CHAR(creado_el, 'YYYY-MM-DD')
      ORDER BY fecha ASC
    `;

    const porMetodoPago = await prisma.$queryRaw<
      Array<{ metodo: string; total: number; cantidad: bigint }>
    >`
      SELECT
        metodo_pago as metodo,
        COALESCE(SUM(total), 0)::float as total,
        COUNT(*)::bigint as cantidad
      FROM ventas
      WHERE negocio_id = ${negocioId}
        AND estado = 'COMPLETADA'
        AND creado_el >= ${desde}
      GROUP BY metodo_pago
      ORDER BY total DESC
    `;

    const topProductos = await prisma.$queryRaw<
      Array<{
        nombre: string;
        cantidad_vendida: bigint;
        total_vendido: number;
      }>
    >`
      SELECT
        p.nombre,
        COALESCE(SUM(iv.cantidad), 0)::bigint as cantidad_vendida,
        COALESCE(SUM(iv.subtotal), 0)::float as total_vendido
      FROM items_venta iv
      JOIN ventas v ON v.id = iv.venta_id
      JOIN productos p ON p.id = iv.producto_id
      WHERE v.negocio_id = ${negocioId}
        AND v.estado = 'COMPLETADA'
        AND v.creado_el >= ${desde}
      GROUP BY p.id, p.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 5
    `;

    const resumen = await prisma.$queryRaw<
      Array<{ total: number; cantidad: bigint; promedio: number }>
    >`
      SELECT
        COALESCE(SUM(total), 0)::float as total,
        COUNT(*)::bigint as cantidad,
        COALESCE(AVG(total), 0)::float as promedio
      FROM ventas
      WHERE negocio_id = ${negocioId}
        AND estado = 'COMPLETADA'
        AND creado_el >= ${desde}
    `;

    return NextResponse.json({
      ventasPorDia: ventasPorDia.map((d) => ({
        fecha: d.fecha,
        total: Number(d.total),
        cantidad: Number(d.cantidad),
      })),
      porMetodoPago: porMetodoPago.map((d) => ({
        metodo: d.metodo,
        total: Number(d.total),
        cantidad: Number(d.cantidad),
      })),
      topProductos: topProductos.map((d) => ({
        nombre: d.nombre,
        cantidadVendida: Number(d.cantidad_vendida),
        totalVendido: Number(d.total_vendido),
      })),
      resumen: {
        total: Number(resumen[0]?.total ?? 0),
        cantidad: Number(resumen[0]?.cantidad ?? 0),
        promedio: Number(resumen[0]?.promedio ?? 0),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener reportes" },
      { status: 500 }
    );
  }
}
