"use client";

import { useState, useTransition } from "react";
import { updateSiteSettings } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/types/database";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [name, setName] = useState(settings.name);
  const [phone, setPhone] = useState(settings.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp ?? "");
  const [email, setEmail] = useState(settings.email ?? "");
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url ?? "");
  const [address, setAddress] = useState(settings.address ?? "");
  const [mapsUrl, setMapsUrl] = useState(settings.maps_url ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const res = await updateSiteSettings({
        name,
        phone,
        whatsapp,
        email,
        instagram_url: instagramUrl,
        address,
        maps_url: mapsUrl,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
    });
  }

  const fields: [string, string, (v: string) => void, string][] = [
    ["Nome da barbearia", name, setName, "text"],
    ["Telefone", phone, setPhone, "text"],
    ["WhatsApp (com DDI, ex: 5511999999999)", whatsapp, setWhatsapp, "text"],
    ["E-mail", email, setEmail, "email"],
    ["Instagram (URL)", instagramUrl, setInstagramUrl, "text"],
    ["Endereço", address, setAddress, "text"],
    ["Link do Google Maps", mapsUrl, setMapsUrl, "text"],
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {fields.map(([label, value, setter, type]) => (
        <div key={label}>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-bone-50 outline-none focus:border-brass-400"
          />
        </div>
      ))}

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          Configurações salvas.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-brass-500 px-6 py-3 text-sm font-medium text-ink-950 hover:bg-brass-400 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
