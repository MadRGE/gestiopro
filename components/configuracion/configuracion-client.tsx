"use client";

import { NegocioForm } from "./negocio-form";
import { PerfilForm } from "./perfil-form";

export function ConfiguracionClient() {
  return (
    <div className="space-y-8">
      <NegocioForm />
      <PerfilForm />
    </div>
  );
}
