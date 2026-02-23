import { auth } from "@/auth";
import { NextResponse } from "next/server";

const ROL_HIERARCHY: Record<string, number> = {
  EMPLEADO: 1,
  DUENIO: 2,
  ADMIN: 3,
};

export async function getAuthSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  const negocioId = (session.user as any).negocioId as string | undefined;
  const rol = ((session.user as any).rol as string) || "EMPLEADO";
  const userId = session.user.id;

  if (!negocioId) {
    return { error: NextResponse.json({ error: "Sin negocio asociado" }, { status: 403 }) };
  }

  return { session, negocioId, rol, userId };
}

export function requireRole(userRol: string, minRole: string) {
  const userLevel = ROL_HIERARCHY[userRol] ?? 0;
  const requiredLevel = ROL_HIERARCHY[minRole] ?? 0;

  if (userLevel < requiredLevel) {
    return NextResponse.json(
      { error: "No tenés permisos para esta acción" },
      { status: 403 }
    );
  }
  return null;
}
