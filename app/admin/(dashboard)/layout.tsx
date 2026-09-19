import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    // O middleware já barrou quem não está logado, então chegar aqui sem
    // sessão significa usuário autenticado SEM perfil (ou perfil ilegível).
    redirect("/admin/login?error=sem-perfil");
  }

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar role={session.profile.role} name={session.profile.full_name} />
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
