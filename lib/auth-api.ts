import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function getAuthSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  const negocioId = (session.user as any).negocioId as string | undefined;

  if (!negocioId) {
    return { error: NextResponse.json({ error: "Sin negocio asociado" }, { status: 403 }) };
  }

  return { session, negocioId };
}
