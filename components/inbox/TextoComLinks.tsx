import { Fragment } from "react";

/**
 * Texto de mensagem com os endereços da web CLICÁVEIS (fork Cavalcante & Guedes).
 *
 * O corpo continua sendo texto: nada de HTML vindo do cliente. Só os trechos
 * que casam com um endereço `http(s)://` ou `www.` viram `<a>`, e o `href` é
 * montado aqui — `javascript:`, `data:` e afins nunca casam com o padrão, então
 * não há como uma mensagem virar um link perigoso. Abre em aba nova, sem
 * `opener` e sem `referrer`, para a página aberta não alcançar o CRM.
 */
const PADRAO_DE_LINK = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;

/** Pontuação que costuma colar no fim do link sem fazer parte dele. */
const SOBRA_NO_FIM = /[.,;:!?)\]}'"]+$/;

export type Pedaco = { tipo: "texto"; valor: string } | { tipo: "link"; valor: string; href: string };

export function separarLinks(texto: string): Pedaco[] {
  const pedacos: Pedaco[] = [];
  let ultimo = 0;
  for (const achado of texto.matchAll(PADRAO_DE_LINK)) {
    const inicio = achado.index ?? 0;
    let link = achado[0];
    const sobra = link.match(SOBRA_NO_FIM)?.[0] ?? "";
    if (sobra) link = link.slice(0, link.length - sobra.length);
    if (!link) continue;
    if (inicio > ultimo) pedacos.push({ tipo: "texto", valor: texto.slice(ultimo, inicio) });
    const href = /^https?:\/\//i.test(link) ? link : `https://${link}`;
    pedacos.push({ tipo: "link", valor: link, href });
    ultimo = inicio + link.length;
  }
  if (ultimo < texto.length) pedacos.push({ tipo: "texto", valor: texto.slice(ultimo) });
  return pedacos;
}

export function TextoComLinks({ texto }: { texto: string }) {
  return (
    <>
      {separarLinks(texto).map((p, i) =>
        p.tipo === "link" ? (
          <a
            key={i}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline underline-offset-2 hover:opacity-80"
            onClick={(e) => e.stopPropagation()}
          >
            {p.valor}
          </a>
        ) : (
          <Fragment key={i}>{p.valor}</Fragment>
        ),
      )}
    </>
  );
}
