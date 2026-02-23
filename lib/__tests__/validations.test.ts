import { describe, it, expect } from "vitest";
import {
  ventaCreateSchema,
  productoCreateSchema,
  clienteCreateSchema,
  cajaAbrirSchema,
  cajaCerrarSchema,
  cajaMovimientoSchema,
  empleadoCreateSchema,
} from "../validations";

describe("ventaCreateSchema", () => {
  it("accepts valid venta", () => {
    const result = ventaCreateSchema.safeParse({
      items: [{ productoId: "abc123", cantidad: 2, precio: 100 }],
      metodoPago: "EFECTIVO",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty items", () => {
    const result = ventaCreateSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects missing items", () => {
    const result = ventaCreateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts optional descuento", () => {
    const result = ventaCreateSchema.safeParse({
      items: [{ productoId: "abc", cantidad: 1, precio: 50 }],
      descuento: 10,
    });
    expect(result.success).toBe(true);
  });
});

describe("productoCreateSchema", () => {
  it("accepts valid producto", () => {
    const result = productoCreateSchema.safeParse({
      nombre: "Test",
      precioVenta: 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty nombre", () => {
    const result = productoCreateSchema.safeParse({
      nombre: "",
      precioVenta: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative precioVenta", () => {
    const result = productoCreateSchema.safeParse({
      nombre: "Test",
      precioVenta: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero precioVenta", () => {
    const result = productoCreateSchema.safeParse({
      nombre: "Test",
      precioVenta: 0,
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults for optional fields", () => {
    const result = productoCreateSchema.safeParse({
      nombre: "Test",
      precioVenta: 100,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stock).toBe(0);
      expect(result.data.unidad).toBe("unidad");
    }
  });
});

describe("clienteCreateSchema", () => {
  it("accepts valid cliente", () => {
    const result = clienteCreateSchema.safeParse({ nombre: "Juan" });
    expect(result.success).toBe(true);
  });

  it("trims nombre", () => {
    const result = clienteCreateSchema.safeParse({ nombre: "  Juan  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nombre).toBe("Juan");
    }
  });

  it("rejects empty nombre", () => {
    const result = clienteCreateSchema.safeParse({ nombre: "" });
    expect(result.success).toBe(false);
  });

  it("accepts optional email", () => {
    const result = clienteCreateSchema.safeParse({
      nombre: "Juan",
      email: "juan@test.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = clienteCreateSchema.safeParse({
      nombre: "Juan",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("cajaAbrirSchema", () => {
  it("accepts empty body with default", () => {
    const result = cajaAbrirSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts montoInicial as number", () => {
    const result = cajaAbrirSchema.safeParse({ montoInicial: 1000 });
    expect(result.success).toBe(true);
  });

  it("accepts montoInicial as string", () => {
    const result = cajaAbrirSchema.safeParse({ montoInicial: "1000" });
    expect(result.success).toBe(true);
  });
});

describe("cajaCerrarSchema", () => {
  it("accepts valid montoFinal", () => {
    const result = cajaCerrarSchema.safeParse({ montoFinal: 5000 });
    expect(result.success).toBe(true);
  });

  it("accepts montoFinal as string", () => {
    const result = cajaCerrarSchema.safeParse({ montoFinal: "5000" });
    expect(result.success).toBe(true);
  });

  it("rejects missing montoFinal", () => {
    const result = cajaCerrarSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("cajaMovimientoSchema", () => {
  it("accepts valid ingreso", () => {
    const result = cajaMovimientoSchema.safeParse({
      tipo: "INGRESO",
      monto: 500,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid egreso", () => {
    const result = cajaMovimientoSchema.safeParse({
      tipo: "EGRESO",
      monto: 200,
      descripcion: "Compra insumos",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid tipo", () => {
    const result = cajaMovimientoSchema.safeParse({
      tipo: "OTRO",
      monto: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing monto", () => {
    const result = cajaMovimientoSchema.safeParse({ tipo: "INGRESO" });
    expect(result.success).toBe(false);
  });
});

describe("empleadoCreateSchema", () => {
  it("accepts valid empleado", () => {
    const result = empleadoCreateSchema.safeParse({
      nombre: "María",
      email: "maria@test.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = empleadoCreateSchema.safeParse({
      nombre: "María",
      email: "maria@test.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = empleadoCreateSchema.safeParse({
      nombre: "María",
      email: "bad",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing nombre", () => {
    const result = empleadoCreateSchema.safeParse({
      email: "maria@test.com",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });
});
