import { AlertCircle } from "lucide-react";

/** Aviso exibido quando uma consulta do painel falha (mesmo estilo dos erros do login). */
export function QueryError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
