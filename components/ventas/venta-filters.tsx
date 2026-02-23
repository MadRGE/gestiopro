"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export interface VentaFilterValues {
  desde: string;
  hasta: string;
  metodoPago: string;
  estado: string;
}

interface VentaFiltersProps {
  filters: VentaFilterValues;
  onFilterChange: (filters: VentaFilterValues) => void;
}

const EMPTY_FILTERS: VentaFilterValues = {
  desde: "",
  hasta: "",
  metodoPago: "",
  estado: "",
};

export function VentaFilters({ filters, onFilterChange }: VentaFiltersProps) {
  function update(partial: Partial<VentaFilterValues>) {
    onFilterChange({ ...filters, ...partial });
  }

  const hasFilters = filters.desde || filters.hasta || filters.metodoPago || filters.estado;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Desde</label>
        <Input
          type="date"
          value={filters.desde}
          onChange={(e) => update({ desde: e.target.value })}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Hasta</label>
        <Input
          type="date"
          value={filters.hasta}
          onChange={(e) => update({ hasta: e.target.value })}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Método de pago</label>
        <Select
          value={filters.metodoPago || "all"}
          onValueChange={(v) => update({ metodoPago: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="EFECTIVO">Efectivo</SelectItem>
            <SelectItem value="DEBITO">Débito</SelectItem>
            <SelectItem value="CREDITO">Crédito</SelectItem>
            <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
            <SelectItem value="QR">QR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Estado</label>
        <Select
          value={filters.estado || "all"}
          onValueChange={(v) => update({ estado: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="COMPLETADA">Completada</SelectItem>
            <SelectItem value="CANCELADA">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onFilterChange(EMPTY_FILTERS)}>
          <X className="mr-1 h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
