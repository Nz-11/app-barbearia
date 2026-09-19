"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ServiceForm } from "@/components/admin/forms/ServiceForm";
import { deleteService } from "@/lib/actions/services";
import type { Service } from "@/lib/types/database";
import { formatDuration, formatPrice } from "@/lib/utils";

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDone() {
    setModalOpen(false);
    router.refresh();
  }

  function handleDelete(service: Service) {
    setDeleteError(null);
    if (!confirm(`Excluir o serviço "${service.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteService(service.id);
      if (res?.error) setDeleteError(res.error);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-bone-200/60">{services.length} serviços cadastrados</p>
        <button
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-full bg-brass-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-brass-400"
        >
          <Plus className="h-4 w-4" /> Novo serviço
        </button>
      </div>

      {deleteError && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {deleteError}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-ink-900/60 text-xs uppercase tracking-wide text-bone-200/50">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Duração</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {services.map((s) => (
              <tr key={s.id} className="bg-ink-900/20">
                <td className="px-4 py-3 text-bone-100">{s.name}</td>
                <td className="px-4 py-3 text-bone-200/70">{formatDuration(s.duration_minutes)}</td>
                <td className="px-4 py-3 text-brass-400">{formatPrice(s.price_cents)}</td>
                <td className="px-4 py-3 text-bone-200/70">{s.active ? "Ativo" : "Inativo"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setEditing(s);
                        setModalOpen(true);
                      }}
                      className="rounded-lg border border-white/10 p-1.5 text-bone-200/70 hover:border-brass-400 hover:text-brass-400"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(s)}
                      className="rounded-lg border border-white/10 p-1.5 text-bone-200/70 hover:border-red-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar serviço" : "Novo serviço"}
      >
        <ServiceForm service={editing} onDone={handleDone} />
      </Modal>
    </div>
  );
}
