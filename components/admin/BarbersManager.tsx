"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Power } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { BarberForm } from "@/components/admin/forms/BarberForm";
import { Avatar } from "@/components/ui/Avatar";
import { setBarberActive } from "@/lib/actions/barbers";
import type { Barber } from "@/lib/types/database";
import { useRouter } from "next/navigation";

export function BarbersManager({ barbers }: { barbers: Barber[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Barber | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(barber: Barber) {
    setEditing(barber);
    setModalOpen(true);
  }

  function handleDone() {
    setModalOpen(false);
    router.refresh();
  }

  function toggleActive(barber: Barber) {
    startTransition(async () => {
      await setBarberActive(barber.id, !barber.active);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-bone-200/60">{barbers.length} barbeiros cadastrados</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full bg-brass-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-brass-400"
        >
          <Plus className="h-4 w-4" /> Novo barbeiro
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((barber) => (
          <div key={barber.id} className="rounded-2xl border border-white/8 bg-ink-900/40 p-5">
            <div className="flex items-start gap-3">
              <Avatar name={barber.name} src={barber.photo_url} className="h-12 w-12 shrink-0" />
              <div className="flex-1">
                <p className="text-bone-50">{barber.name}</p>
                <p className="text-xs text-bone-200/50">
                  {barber.active ? "Ativo" : "Inativo"}
                  {barber.profile_id && " · com acesso ao painel"}
                </p>
              </div>
            </div>
            {barber.specialties.length > 0 && (
              <p className="mt-3 text-xs text-bone-200/60">{barber.specialties.join(" · ")}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => openEdit(barber)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-bone-100 hover:border-brass-400 hover:text-brass-400"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </button>
              <button
                disabled={isPending}
                onClick={() => toggleActive(barber)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-bone-100 hover:border-red-400 hover:text-red-400"
              >
                <Power className="h-3.5 w-3.5" /> {barber.active ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar barbeiro" : "Novo barbeiro"}
      >
        <BarberForm barber={editing} onDone={handleDone} />
      </Modal>
    </div>
  );
}
