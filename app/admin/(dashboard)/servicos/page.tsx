import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAllServices } from "@/lib/data/admin";
import { ServicesManager } from "@/components/admin/ServicesManager";

export default async function ServicosPage() {
  const session = await getSession();
  if (session?.profile.role !== "admin") redirect("/admin");

  const services = await getAllServices();

  return (
    <div>
      <h1 className="font-display text-2xl text-bone-50 sm:text-3xl">Serviços</h1>
      <p className="mt-1 text-sm text-bone-200/60">Gerencie o catálogo de serviços.</p>
      <div className="mt-6">
        <ServicesManager services={services} />
      </div>
    </div>
  );
}
