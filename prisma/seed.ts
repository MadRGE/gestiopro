import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL } as any);
const prisma = new PrismaClient({ adapter });

interface RubroSeed {
  nombre: string;
  descripcion: string;
  icono: string;
  config: {
    labels: Record<string, string>;
    categoriasDefault: string[];
    unidadDefault: string;
    features: string[];
  };
}

const RUBROS_FASE_1: RubroSeed[] = [
  {
    nombre: "Kiosco",
    descripcion: "Kiosco, maxikiosco y drugstore",
    icono: "Store",
    config: {
      labels: {},
      categoriasDefault: ["Golosinas", "Bebidas", "Cigarrillos", "Snacks", "Lácteos", "Limpieza"],
      unidadDefault: "unidad",
      features: [],
    },
  },
  {
    nombre: "Farmacia",
    descripcion: "Farmacia y droguería",
    icono: "Pill",
    config: {
      labels: {
        productos: "Medicamentos",
        producto: "Medicamento",
        clientes: "Pacientes",
        cliente: "Paciente",
        ventas: "Dispensas",
        venta: "Dispensa",
        ventasDelDia: "Dispensas del día",
      },
      categoriasDefault: ["Analgésicos", "Antibióticos", "Vitaminas", "Dermatológicos", "Higiene"],
      unidadDefault: "unidad",
      features: [],
    },
  },
  {
    nombre: "Ferretería",
    descripcion: "Ferretería y materiales",
    icono: "Wrench",
    config: {
      labels: {
        productos: "Artículos",
        producto: "Artículo",
      },
      categoriasDefault: ["Herramientas", "Electricidad", "Plomería", "Pinturas", "Tornillería", "Construcción"],
      unidadDefault: "unidad",
      features: [],
    },
  },
  {
    nombre: "Ropa",
    descripcion: "Indumentaria y accesorios",
    icono: "Shirt",
    config: {
      labels: {
        productos: "Prendas",
        producto: "Prenda",
      },
      categoriasDefault: ["Remeras", "Pantalones", "Camperas", "Calzado", "Accesorios", "Ropa interior"],
      unidadDefault: "unidad",
      features: [],
    },
  },
  {
    nombre: "Panadería",
    descripcion: "Panadería y confitería",
    icono: "CakeSlice",
    config: {
      labels: {
        ventasDelDia: "Producción del día",
      },
      categoriasDefault: ["Panes", "Facturas", "Tortas", "Sandwiches", "Bebidas"],
      unidadDefault: "unidad",
      features: [],
    },
  },
  {
    nombre: "Peluquería",
    descripcion: "Peluquería y estética",
    icono: "Scissors",
    config: {
      labels: {
        productos: "Servicios",
        producto: "Servicio",
        ventas: "Atenciones",
        venta: "Atención",
        ventasDelDia: "Atenciones del día",
      },
      categoriasDefault: ["Corte", "Color", "Tratamiento", "Peinado", "Barba"],
      unidadDefault: "servicio",
      features: [],
    },
  },
];

async function main() {
  console.log("Seeding Phase 1 rubros...");

  for (const rubro of RUBROS_FASE_1) {
    await prisma.rubro.upsert({
      where: { nombre: rubro.nombre },
      update: {
        descripcion: rubro.descripcion,
        icono: rubro.icono,
        config: rubro.config,
      },
      create: {
        nombre: rubro.nombre,
        descripcion: rubro.descripcion,
        icono: rubro.icono,
        config: rubro.config,
      },
    });
    console.log(`  ✓ ${rubro.nombre}`);
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
