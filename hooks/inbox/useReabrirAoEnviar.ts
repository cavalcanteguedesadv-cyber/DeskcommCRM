"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { showApiError } from "@/components/feedback/ApiErrorToast";

/**
 * Fork C&G: reabre a conversa encerrada quando alguém envia por ela. É a mesma
 * reabertura do botão "Reabrir" (`useReopenConversation`), num módulo próprio.
 */
export function useReabrirAoEnviar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { conversation_id: string; expected_revision?: number | null }) =>
      apiClient.patch(`/api/v1/conversations/${args.conversation_id}`, {
        status: "open",
        expected_revision: args.expected_revision,
      }),
    onError: showApiError,
    onSettled: (_data, _error, args) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["conversation", args.conversation_id] });
    },
  });
}
