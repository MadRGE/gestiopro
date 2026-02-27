"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Proveedor } from "./proveedor-table";

const CONDICIONES_PAGO = [
  { value: "CONTADO", label: "Contado" },
  { value: "TREINTA_DIAS", label: "30 días" },
  { value: "SESENTA_DIAS", label: "60 días" },
  { value: "NOVENTA_DIAS", label: "90 días" },
];

interface ProveedorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proveedor: Proveedor | null;
  onSuccess: () => void;
}

export function ProveedorDialog({
  open,
  onOpenChange,
  proveedor,
  onSuccess,
}: ProveedorDialogProps) {
  const isEditing = !!proveedor;

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [cuit, setCuit] = useState("");
  const [notas, setNotas] = useState("");
  const [nombreContacto, setNombreContacto] = useState("");
  const [cargoContacto, setCargoContacto] = useState("");
  const [condicionPago, setCondicionPago] = useState("CONTADO");
  const [cuentaBancaria, setCuentaBancaria] = useState("");
  const [cbu, setCbu] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (proveedor) {
        setNombre(proveedor.nombre);
        setTelefono(proveedor.telefono || "");
        setEmail(proveedor.email || "");
        setDireccion(proveedor.direccion || "");
        setCuit(proveedor.cuit || "");
        setNotas(proveedor.notas || "");
        setNombreContacto(proveedor.nombreContacto || "");
        setCargoContacto(proveedor.cargoContacto || "");
        setCondicionPago(proveedor.condicionPago || "CONTADO");
        setCuentaBancaria(proveedor.cuentaBancaria || "");
        setCbu(proveedor.cbu || "");
      } else {
        setNombre("");
        setTelefono("");
        setEmail("");
        setDireccion("");
        setCuit("");
        setNotas("");
        setNombreContacto("");
        setCargoContacto("");
        setCondicionPago("CONTADO");
        setCuentaBancaria("");
        setCbu("");
      }
      setError("");
    }
  }, [open, proveedor]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      nombre,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null,
      cuit: cuit || null,
      notas: notas || null,
      nombreContacto: nombreContacto || null,
      cargoContacto: cargoContacto || null,
      condicionPago,
      cuentaBancaria: cuentaBancaria || null,
      cbu: cbu || null,
    };

    try {
      const url = isEditing
        ? `/api/proveedores/${proveedor.id}`
        : "/api/proveedores";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar proveedor" : "Nuevo proveedor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="prov-nombre">Nombre *</Label>
            <Input
              id="prov-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del proveedor"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prov-telefono">Teléfono</Label>
              <Input
                id="prov-telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 11 1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prov-email">Email</Label>
              <Input
                id="prov-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prov-direccion">Dirección</Label>
            <Input
              id="prov-direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección del proveedor"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prov-cuit">CUIT</Label>
              <Input
                id="prov-cuit"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                placeholder="XX-XXXXXXXX-X"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prov-condicion">Condición de pago</Label>
              <Select value={condicionPago} onValueChange={setCondicionPago}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDICIONES_PAGO.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prov-contacto">Nombre de contacto</Label>
              <Input
                id="prov-contacto"
                value={nombreContacto}
                onChange={(e) => setNombreContacto(e.target.value)}
                placeholder="Persona de contacto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prov-cargo">Cargo</Label>
              <Input
                id="prov-cargo"
                value={cargoContacto}
                onChange={(e) => setCargoContacto(e.target.value)}
                placeholder="Ej: Ventas"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prov-cuenta">Cuenta bancaria</Label>
              <Input
                id="prov-cuenta"
                value={cuentaBancaria}
                onChange={(e) => setCuentaBancaria(e.target.value)}
                placeholder="Nro. de cuenta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prov-cbu">CBU</Label>
              <Input
                id="prov-cbu"
                value={cbu}
                onChange={(e) => setCbu(e.target.value)}
                placeholder="22 dígitos"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prov-notas">Notas</Label>
            <Textarea
              id="prov-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales sobre el proveedor"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear proveedor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
