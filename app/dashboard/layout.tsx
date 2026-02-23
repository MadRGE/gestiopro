import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { RubroProvider } from "@/components/providers/rubro-provider";
import { resolveLabels, type RubroConfig } from "@/lib/rubro-config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user?.id;
  const dbUser = userId
    ? await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          rol: true,
          negocio: {
            select: {
              rubro: { select: { nombre: true, config: true } },
            },
          },
        },
      })
    : null;
  const rol = dbUser?.rol ?? "EMPLEADO";
  const rubroConfig = (dbUser?.negocio?.rubro?.config as unknown as RubroConfig) ?? null;
  const rubroNombre = dbUser?.negocio?.rubro?.nombre ?? "General";
  const labels = resolveLabels(rubroConfig);

  return (
    <RubroProvider labels={labels} rubroNombre={rubroNombre}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar rol={rol} labels={labels} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={session.user} rol={rol} labels={labels} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RubroProvider>
  );
}
