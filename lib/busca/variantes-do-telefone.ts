/**
 * Fork C&G: o mesmo celular brasileiro aparece com e sem o 9 depois do DDD.
 * O WhatsApp entrega muitos números antigos sem o 9 (556196529869), e quem
 * busca digita com ele (61 99652-9869) — ou o contrário. A busca tenta as duas
 * formas, para o número achar a conversa de qualquer jeito que for digitado.
 *
 * Recebe só dígitos. Devolve a forma digitada e, quando couber, a outra.
 */
export function variantesDoTelefone(digitos: string): string[] {
  const d = digitos.replace(/\D/g, "");
  const formas = new Set<string>([d]);
  // Com o 9: tira o 9 (país+DDD+9, DDD+9, só o 9 inicial).
  if (d.length === 13 && d.startsWith("55") && d[4] === "9") formas.add(d.slice(0, 4) + d.slice(5));
  if (d.length === 11 && d[2] === "9") formas.add(d.slice(0, 2) + d.slice(3));
  if (d.length === 9 && d[0] === "9") formas.add(d.slice(1));
  // Sem o 9: põe o 9 (país+DDD+8, DDD+8). Celular começa com 6 a 9.
  if (d.length === 12 && d.startsWith("55") && /[6-9]/.test(d[4] ?? "")) formas.add(d.slice(0, 4) + "9" + d.slice(4));
  if (d.length === 10 && /[6-9]/.test(d[2] ?? "")) formas.add(d.slice(0, 2) + "9" + d.slice(2));
  return [...formas];
}
