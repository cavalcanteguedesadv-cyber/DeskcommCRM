"use client";
import { useContext } from "react";
import { QueryClientContext } from "@tanstack/react-query";
import { useT } from "@/hooks/i18n/useT";
import { cn } from "@/lib/utils";
import { usePipelines, usePipelineStages } from "@/hooks/webhooks/useWebhookSources";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Fork C&G: filtro do Inbox pela ETAPA do funil em que o caso do contato está.
 * Lê as colunas do primeiro funil da organização (o escritório tem um só).
 */
export function SeletorDeEtapa(props: {
  value: string | undefined;
  onChange: (etapa: string | undefined) => void;
}) {
  const temProvedor = useContext(QueryClientContext) !== undefined;
  return temProvedor ? <SeletorComFunil {...props} /> : null;
}

function SeletorComFunil({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (etapa: string | undefined) => void;
}) {
  const t = useT();
  const { data: funis } = usePipelines();
  const funil = Array.isArray(funis?.data) ? funis.data[0] : undefined;
  const { data: quadro } = usePipelineStages(funil?.id ?? null);
  const etapas = Array.isArray(quadro?.data?.stages) ? quadro.data.stages : [];
  if (!funil || etapas.length === 0) return null;

  return (
    <Select value={value ?? "all"} onValueChange={(v) => onChange(v === "all" ? undefined : v)}>
      <SelectTrigger
        className={cn(
          "h-8 min-w-0 w-full rounded-full border-transparent bg-surface-elevated px-3 text-xs shadow-none",
          value != null && "border-accent bg-accent-soft text-accent",
        )}
        aria-label={t("Filtrar por etapa do funil")}
      >
        <SelectValue placeholder={t("Todas as etapas do funil")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("Todas as etapas do funil")}</SelectItem>
        {etapas.map((etapa) => (
          <SelectItem key={etapa.id} value={etapa.id}>
            {etapa.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
