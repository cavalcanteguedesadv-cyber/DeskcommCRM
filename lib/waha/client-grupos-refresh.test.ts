/**
 * Fork C&G: no NOWEB o `GET /groups` pode vir vazio até o WAHA buscar os grupos
 * no WhatsApp. `listarGrupos` pede `POST /groups/refresh` uma vez e lê de novo.
 */
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { WahaClient } from "./client";

let server: Server;
let base = "";
let atualizado = false;
let refreshes = 0;
let refreshExiste = true;
/** Fork C&G: com `ignore.groups` ligado o NOWEB não guarda grupo, nem depois da busca. */
let ignoraGrupos = false;
let puts = 0;

beforeAll(async () => {
  server = createServer((req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.url === "/api/s1/groups/refresh" && req.method === "POST") {
      if (!refreshExiste) {
        res.statusCode = 404;
        return res.end("{}");
      }
      refreshes++;
      if (!ignoraGrupos) atualizado = true;
      return res.end("{}");
    }
    if (req.url === "/api/sessions/s1" && req.method === "GET") {
      return res.end(
        JSON.stringify({ name: "s1", status: "WORKING", config: { ignore: { status: true, groups: ignoraGrupos } } }),
      );
    }
    if (req.url === "/api/sessions/s1" && req.method === "PUT") {
      let corpo = "";
      req.on("data", (c) => (corpo += c));
      req.on("end", () => {
        puts++;
        ignoraGrupos = JSON.parse(corpo).config.ignore.groups === true;
        res.end("{}");
      });
      return;
    }
    if (req.url === "/api/s1/groups") {
      return res.end(
        JSON.stringify(atualizado ? { "120363000000000001@g.us": { id: "120363000000000001@g.us", subject: "Equipe" } } : {}),
      );
    }
    res.statusCode = 404;
    res.end("{}");
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((r) => server.close(() => r())));

beforeEach(() => {
  atualizado = false;
  refreshes = 0;
  refreshExiste = true;
  ignoraGrupos = false;
  puts = 0;
});

describe("listarGrupos com a lista do NOWEB ainda vazia", () => {
  it("pede a busca dos grupos uma vez e devolve a lista nova", async () => {
    const grupos = await new WahaClient(base, "k").listarGrupos("s1");
    expect(refreshes).toBe(1);
    expect(grupos).toEqual([{ chatId: "120363000000000001@g.us", subject: "Equipe" }]);
  });

  it("não pede a busca quando a lista já veio cheia", async () => {
    atualizado = true;
    await new WahaClient(base, "k").listarGrupos("s1");
    expect(refreshes).toBe(0);
  });

  it("sem a rota de busca no WAHA, segue com a lista vazia", async () => {
    refreshExiste = false;
    expect(await new WahaClient(base, "k").listarGrupos("s1")).toEqual([]);
  });

  it("com o filtro de grupos ligado, desliga o filtro e busca de novo", async () => {
    ignoraGrupos = true;
    const grupos = await new WahaClient(base, "k").listarGrupos("s1");
    expect(puts).toBe(1);
    expect(ignoraGrupos).toBe(false);
    expect(refreshes).toBe(2);
    expect(grupos).toHaveLength(1);
  });
});
