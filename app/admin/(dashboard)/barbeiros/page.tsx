import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAllBarbers } from "@/lib/data/admin";
import { BarbersManager } from "@/components/admin/BarbersManager";

export default async function BarbeirosPage() {
  const session = await getSession();
  if (session?.profile.role !== "admin") redirect("/admin");

  const barbers = await getAllBarbers();

  return (
    <div>
      <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">Barbeiros</h1>
      <p className="mt-1 text-sm text-bone-200/60">Gerencie os profissionais da barbearia.</p>
      <div className="mt-6">
        <BarbersManager barbers={barbers} />
      </div>
    </div>
  );
}
