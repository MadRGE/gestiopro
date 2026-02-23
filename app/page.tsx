import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Gestión<span className="text-primary">Pro</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Sistema de gestión integral para tu negocio. Ventas, stock, reportes y
          más.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
