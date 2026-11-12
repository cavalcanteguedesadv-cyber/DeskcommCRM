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

beforeAll(async () => {
  server = createServer((req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.url === "/api/s1/groups/refresh" && req.method === "POST") {
      if (!refreshExiste) {
        res.statusCode = 404;
        return res.end("{}");
      }
      refreshes++;
      atualizado = true;
      return res.end("{}");
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
});
