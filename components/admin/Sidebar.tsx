"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  Users,
  Scissors,
  Wrench,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types/database";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "barber"] },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays, roles: ["admin", "barber"] },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: ListChecks, roles: ["admin", "barber"] },
  { href: "/admin/clientes", label: "Clientes", icon: Users, roles: ["admin", "barber"] },
  { href: "/admin/barbeiros", label: "Barbeiros", icon: Scissors, roles: ["admin"] },
  { href: "/admin/servicos", label: "Serviços", icon: Wrench, roles: ["admin"] },
  { href: "/admin/horarios", label: "Horários", icon: Clock, roles: ["admin", "barber"] },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, roles: ["admin"] },
] as const;

export function Sidebar({ role, name }: { role: UserRole; name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const links = items.filter((item) => (item.roles as readonly string[]).includes(role));

  const content = (
    <>
      <div className="px-5 py-6">
        <p className="font-display text-lg text-bone-50">Painel</p>
        <p className="mt-0.5 truncate text-xs text-bone-200/50">
          {name} · {role === "admin" ? "Administrador" : "Barbeiro"}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-brass-400/15 text-brass-400"
                  : "text-bone-200/70 hover:bg-white/5 hover:text-bone-50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bone-200/70 transition-colors hover:bg-white/5 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/5 bg-ink-900 px-4 py-3 lg:hidden">
        <p className="font-display text-lg text-bone-50">Painel</p>
        <button onClick={() => setOpen(true)} className="p-2 text-bone-50">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-ink-900 lg:flex">
        {content}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink-900">
            <div className="flex justify-end p-3">
              <button onClick={() => setOpen(false)} className="p-2 text-bone-50">
                <X className="h-6 w-6" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
