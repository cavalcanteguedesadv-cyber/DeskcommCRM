"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useT } from "@/hooks/i18n/useT";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CaretLeft, CaretRight, DownloadSimple } from "@/lib/ui/icons";
import { cn } from "@/lib/utils";
import { mediaDownloadSrc, mediaSrc } from "./media-utils";

/**
 * Fork C&G: visualizador de fotos e PDFs da conversa, como no WhatsApp.
 *
 * Abre grande, passa para a anterior e a próxima (setas na tela e ← → no
 * teclado), mostra "3 de 12", amplia a foto com um clique e mostra o PDF na
 * própria tela. A lista é a das mensagens já carregadas na conversa, em ordem.
 */
export interface ItemDaGaleria {
  id: string;
  tipo: "imagem" | "pdf";
  rotulo: string;
}

interface Galeria {
  temItem: (id: string) => boolean;
  abrir: (id: string) => void;
}

const GaleriaContext = createContext<Galeria | null>(null);

export function useGaleriaDaConversa(): Galeria | null {
  return useContext(GaleriaContext);
}

export function GaleriaDaConversa({ itens, children }: { itens: ItemDaGaleria[]; children: ReactNode }) {
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const indices = useMemo(() => new Map(itens.map((item, i) => [item.id, i])), [itens]);
  const galeria = useMemo<Galeria>(
    () => ({ temItem: (id) => indices.has(id), abrir: (id) => setAbertoId(id) }),
    [indices],
  );
  const indice = abertoId != null ? indices.get(abertoId) : undefined;

  return (
    <GaleriaContext.Provider value={galeria}>
      {children}
      {indice != null && (
        <Visualizador
          itens={itens}
          indice={indice}
          irPara={(i) => setAbertoId(itens[i]?.id ?? null)}
          fechar={() => setAbertoId(null)}
        />
      )}
    </GaleriaContext.Provider>
  );
}

function Visualizador({
  itens,
  indice,
  irPara,
  fechar,
}: {
  itens: ItemDaGaleria[];
  indice: number;
  irPara: (i: number) => void;
  fechar: () => void;
}) {
  const t = useT();
  const [ampliada, setAmpliada] = useState(false);
  const item = itens[indice]!;
  const temAnterior = indice > 0;
  const temProxima = indice < itens.length - 1;

  const anterior = useCallback(() => {
    if (temAnterior) { setAmpliada(false); irPara(indice - 1); }
  }, [temAnterior, irPara, indice]);
  const proxima = useCallback(() => {
    if (temProxima) { setAmpliada(false); irPara(indice + 1); }
  }, [temProxima, irPara, indice]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [anterior, proxima]);

  const seta = "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-0";

  return (
    <Dialog open onOpenChange={(aberto) => { if (!aberto) fechar(); }}>
      <DialogContent className="flex h-[92vh] w-[96vw] max-w-[96vw] flex-col gap-2 border-none bg-black/90 p-3 text-white shadow-none sm:max-w-[96vw]">
        <DialogTitle className="sr-only">{item.rotulo}</DialogTitle>
        <div className="flex items-center gap-3 pr-10 text-sm">
          <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
          <span className="tabular-nums opacity-80">
            {t("{n} de {total}").replace("{n}", String(indice + 1)).replace("{total}", String(itens.length))}
          </span>
          <a
            href={mediaDownloadSrc(item.id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10"
          >
            <DownloadSimple size={16} aria-hidden />
            {t("Baixar")}
          </a>
        </div>
        <div className="relative min-h-0 flex-1">
          <button type="button" aria-label={t("Anterior")} className={cn(seta, "left-2")} disabled={!temAnterior} onClick={anterior}>
            <CaretLeft size={22} aria-hidden />
          </button>
          <div className="flex h-full w-full items-center justify-center overflow-auto">
            {item.tipo === "imagem" ? (
              <button
                type="button"
                onClick={() => setAmpliada((v) => !v)}
                aria-label={ampliada ? t("Reduzir imagem") : t("Ampliar imagem")}
                className={cn("max-h-full", ampliada ? "cursor-zoom-out" : "cursor-zoom-in")}
              >
                <img
                  key={item.id}
                  src={mediaSrc(item.id)}
                  alt={item.rotulo}
                  style={{ transform: ampliada ? "scale(2)" : undefined, transformOrigin: ampliada ? "top left" : undefined }}
                  className="max-h-[82vh] max-w-full object-contain transition-transform duration-200 motion-reduce:transition-none"
                />
              </button>
            ) : (
              <iframe key={item.id} src={mediaSrc(item.id)} title={item.rotulo} className="h-full w-full rounded-md bg-white" />
            )}
          </div>
          <button type="button" aria-label={t("Próxima")} className={cn(seta, "right-2")} disabled={!temProxima} onClick={proxima}>
            <CaretRight size={22} aria-hidden />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
