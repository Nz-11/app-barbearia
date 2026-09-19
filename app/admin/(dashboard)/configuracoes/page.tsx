import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/admin";
import { SettingsForm } from "@/components/admin/forms/SettingsForm";

export default async function ConfiguracoesPage() {
  const session = await getSession();
  if (session?.profile.role !== "admin") redirect("/admin");

  const settings = await getSiteSettings();

  if (!settings) {
    return <p className="text-sm text-red-400">Não foi possível carregar as configurações.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">Configurações</h1>
      <p className="mt-1 text-sm text-bone-200/60">
        Dados de contato e localização registrados no banco de dados.
      </p>
      <p className="mt-2 max-w-lg text-xs text-bone-200/40">
        Observação: as seções públicas do site atualmente usam{" "}
        <code className="rounded bg-white/5 px-1">lib/config/site.ts</code> como fonte de verdade
        (build estático). Estes valores ficam salvos aqui para referência e para uma futura
        integração completa do site com o banco.
      </p>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
