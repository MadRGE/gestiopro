"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { RubroLabels } from "@/lib/rubro-config";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Store,
  Tag,
  Wallet,
  Users,
  UserCog,
} from "lucide-react";

function getNavigation(labels: RubroLabels) {
  return [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "DUENIO", "EMPLEADO"] },
    { name: labels.productos, href: "/dashboard/productos", icon: Package, roles: ["ADMIN", "DUENIO", "EMPLEADO"] },
    { name: labels.categorias, href: "/dashboard/categorias", icon: Tag, roles: ["ADMIN", "DUENIO"] },
    { name: labels.ventas, href: "/dashboard/ventas", icon: ShoppingCart, roles: ["ADMIN", "DUENIO", "EMPLEADO"] },
    { name: "Caja", href: "/dashboard/caja", icon: Wallet, roles: ["ADMIN", "DUENIO", "EMPLEADO"] },
    { name: labels.clientes, href: "/dashboard/clientes", icon: Users, roles: ["ADMIN", "DUENIO"] },
    { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3, roles: ["ADMIN", "DUENIO"] },
    { name: "Empleados", href: "/dashboard/empleados", icon: UserCog, roles: ["ADMIN", "DUENIO"] },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings, roles: ["ADMIN", "DUENIO"] },
  ];
}

interface MobileSidebarProps {
  rol: string;
  labels: RubroLabels;
}

export function MobileSidebar({ rol, labels }: MobileSidebarProps) {
  const pathname = usePathname();
  const navigation = getNavigation(labels);
  const filteredNav = navigation.filter((item) => item.roles.includes(rol));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Store className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">
          Gestión<span className="text-primary">Pro</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
