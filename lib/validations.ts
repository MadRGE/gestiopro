import { z } from "zod";
import { NextResponse } from "next/server";

// Ventas
export const ventaCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productoId: z.string().min(1, "productoId es requerido"),
        cantidad: z.number().int().min(1, "Cantidad debe ser al menos 1"),
        precio: z.number().min(0, "Precio no puede ser negativo"),
      })
    )
    .min(1, "Debe incluir al menos un item"),
  metodoPago: z.enum(["EFECTIVO", "DEBITO", "CREDITO", "TRANSFERENCIA", "QR"]).optional().default("EFECTIVO"),
  clienteId: z.string().nullable().optional(),
  descuento: z.union([z.number().min(0, "Descuento no puede ser negativo"), z.string()]).optional(),
});

// Productos
export const productoCreateSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  precioVenta: z.number({ error: "El precio de venta es requerido" }).positive("El precio de venta debe ser mayor a 0"),
  descripcion: z.string().nullable().optional(),
  codigoBarras: z.string().nullable().optional(),
  precioCompra: z.number().min(0).optional().default(0),
  stock: z.number().int().min(0).optional().default(0),
  stockMinimo: z.number().int().min(0).optional().default(0),
  unidad: z.string().optional().default("unidad"),
  categoriaId: z.string().nullable().optional(),
  proveedorId: z.string().nullable().optional(),
});

export const productoUpdateSchema = productoCreateSchema;

// Clientes
export const clienteCreateSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .transform((v) => v.trim()),
  telefono: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  email: z
    .string()
    .email("Email inválido")
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
});

export const clienteUpdateSchema = clienteCreateSchema;

// Caja
export const cajaAbrirSchema = z.object({
  montoInicial: z
    .union([z.number().min(0, "Monto inicial no puede ser negativo"), z.string()])
    .optional()
    .default(0),
});

export const cajaCerrarSchema = z.object({
  montoFinal: z.union([
    z.number().min(0, "Monto final no puede ser negativo"),
    z.string().min(1, "Debe ingresar el monto final"),
  ]),
});

export const cajaMovimientoSchema = z.object({
  tipo: z.enum(["INGRESO", "EGRESO"], {
    error: "Tipo debe ser INGRESO o EGRESO",
  }),
  monto: z.union([
    z.number().positive("Monto debe ser mayor a 0"),
    z.string().min(1, "Monto es requerido"),
  ]),
  descripcion: z.string().nullable().optional(),
});

// Proveedores
export const proveedorCreateSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .transform((v) => v.trim()),
  telefono: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  email: z
    .string()
    .email("Email inválido")
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  direccion: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  cuit: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  notas: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  nombreContacto: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  cargoContacto: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  condicionPago: z
    .enum(["CONTADO", "TREINTA_DIAS", "SESENTA_DIAS", "NOVENTA_DIAS"])
    .optional()
    .default("CONTADO"),
  cuentaBancaria: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  cbu: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
});

export const proveedorUpdateSchema = proveedorCreateSchema;

// Empleados
export const empleadoCreateSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.literal("EMPLEADO").optional(),
});

// Helper
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { data: T; error?: undefined } | { data?: undefined; error: NextResponse } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      error: NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      ),
    };
  }
  return { data: parsed.data };
}
