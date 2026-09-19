"use client";

import { useEffect, useState } from "react";

export interface DetailsValue {
  name: string;
  phone: string;
  email: string;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function DetailsStep({
  value,
  onChange,
  onValidChange,
}: {
  value: DetailsValue;
  onChange: (value: DetailsValue) => void;
  onValidChange?: (valid: boolean) => void;
}) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const nameError = value.name.trim().length < 3 ? "Informe seu nome completo." : null;
  const phoneDigits = value.phone.replace(/\D/g, "");
  const phoneError = phoneDigits.length < 10 ? "Informe um telefone válido com DDD." : null;
  const emailError =
    value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)
      ? "E-mail inválido."
      : null;

  const isValid = !nameError && !phoneError && !emailError;
  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
          Nome completo *
        </label>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder="Seu nome"
          className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3.5 text-bone-50 outline-none transition-colors focus:border-brass-400"
        />
        {touched.name && nameError && (
          <p className="mt-1.5 text-xs text-red-400">{nameError}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
          Telefone / WhatsApp *
        </label>
        <input
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: formatPhone(e.target.value) })}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          placeholder="(11) 90000-0000"
          inputMode="tel"
          className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3.5 text-bone-50 outline-none transition-colors focus:border-brass-400"
        />
        {touched.phone && phoneError && (
          <p className="mt-1.5 text-xs text-red-400">{phoneError}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-bone-200/50">
          E-mail (opcional)
        </label>
        <input
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="voce@email.com"
          inputMode="email"
          className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3.5 text-bone-50 outline-none transition-colors focus:border-brass-400"
        />
        {touched.email && emailError && (
          <p className="mt-1.5 text-xs text-red-400">{emailError}</p>
        )}
      </div>
    </div>
  );
}
