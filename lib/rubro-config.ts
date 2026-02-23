export interface RubroLabels {
  productos: string;
  producto: string;
  clientes: string;
  cliente: string;
  ventas: string;
  venta: string;
  categorias: string;
  stockBajo: string;
  ventasDelDia: string;
}

export const DEFAULT_LABELS: RubroLabels = {
  productos: "Productos",
  producto: "Producto",
  clientes: "Clientes",
  cliente: "Cliente",
  ventas: "Ventas",
  venta: "Venta",
  categorias: "Categorías",
  stockBajo: "Stock bajo",
  ventasDelDia: "Ventas del día",
};

export interface RubroConfig {
  labels: Partial<RubroLabels>;
  categoriasDefault?: string[];
  unidadDefault?: string;
  features?: string[];
}

export function resolveLabels(config: RubroConfig | null): RubroLabels {
  if (!config?.labels) return DEFAULT_LABELS;
  return { ...DEFAULT_LABELS, ...config.labels };
}
