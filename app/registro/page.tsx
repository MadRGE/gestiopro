"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store, Loader2 } from "lucide-react";

interface Rubro {
  id: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
}

export default function RegistroPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rubros, setRubros] = useState<Rubro[]>([]);

  useEffect(() => {
    fetch("/api/rubros")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRubros(data);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      password: formData.get("password"),
      negocioNombre: formData.get("negocioNombre"),
      rubroId: formData.get("rubroId"),
    };

    const confirmPassword = formData.get("confirmPassword");
    if (data.password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Error al crear la cuenta");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error al crear la cuenta. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Crear cuenta en Gestión
            <span className="text-primary">Pro</span>
          </CardTitle>
          <CardDescription>
            Configurá tu negocio en minutos
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nombre">Tu nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="negocioNombre">Nombre del negocio</Label>
              <Input
                id="negocioNombre"
                name="negocioNombre"
                placeholder="Mi Kiosco"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rubroId">Rubro</Label>
              <select
                id="rubroId"
                name="rubroId"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Seleccioná un rubro</option>
                {rubros.map((rubro) => (
                  <option key={rubro.id} value={rubro.id}>
                    {rubro.nombre}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear cuenta
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
