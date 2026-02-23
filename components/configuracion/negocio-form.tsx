"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface NegocioData {
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  cuit: string | null;
  condicionFiscal: string | null;
  rubro: { nombre: string };
}

export function NegocioForm() {
  const [data, setData] = useState<NegocioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cuit, setCuit] = useState("");
  const [condicionFiscal, setCondicionFiscal] = useState("");

  useEffect(() => {
    fetch("/api/configuracion")
      .then((res) => res.json())
      .then((d: NegocioData) => {
        setData(d);
        setNombre(d.nombre || "");
        setDireccion(d.direccion || "");
        setTelefono(d.telefono || "");
        setCuit(d.cuit || "");
        setCondicionFiscal(d.condicionFiscal || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          direccion,
          telefono,
          cuit,
          condicionFiscal,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }
      toast.success("Datos del negocio actualizados");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-[400px] rounded-xl" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Datos del negocio</CardTitle>
          {data?.rubro && (
            <Badge variant="secondary">{data.rubro.nombre}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="neg-nombre">Nombre</Label>
            <Input
              id="neg-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neg-direccion">Dirección</Label>
            <Input
              id="neg-direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="neg-telefono">Teléfono</Label>
              <Input
                id="neg-telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neg-cuit">CUIT</Label>
              <Input
                id="neg-cuit"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Condición fiscal</Label>
            <Select value={condicionFiscal} onValueChange={setCondicionFiscal}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monotributo">Monotributo</SelectItem>
                <SelectItem value="Responsable Inscripto">
                  Responsable Inscripto
                </SelectItem>
                <SelectItem value="Exento">Exento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
