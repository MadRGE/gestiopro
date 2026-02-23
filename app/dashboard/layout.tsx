import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

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
        select: { rol: true },
      })
    : null;
  const rol = dbUser?.rol ?? "EMPLEADO";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar rol={rol} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session.user} rol={rol} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
