import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextoComLinks, separarLinks } from "./TextoComLinks";

describe("TextoComLinks (fork Cavalcante & Guedes)", () => {
  it("transforma http(s) e www em link que abre em aba nova", () => {
    render(<p><TextoComLinks texto="Veja https://docs.google.com/d/abc e www.tjdft.jus.br." /></p>);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "https://docs.google.com/d/abc");
    expect(links[0]).toHaveAttribute("target", "_blank");
    expect(links[0].getAttribute("rel")).toContain("noopener");
    expect(links[1]).toHaveAttribute("href", "https://www.tjdft.jus.br");
  });

  it("não deixa a pontuação do fim entrar no link", () => {
    const p = separarLinks("abre aqui (https://exemplo.com/x).");
    expect(p.find((x) => x.tipo === "link")).toMatchObject({ valor: "https://exemplo.com/x" });
  });

  it("nunca cria link de esquema perigoso", () => {
    render(<p><TextoComLinks texto="javascript:alert(1) data:text/html,oi" /></p>);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("texto sem link volta igual", () => {
    expect(separarLinks("bom dia, tudo bem?")).toEqual([{ tipo: "texto", valor: "bom dia, tudo bem?" }]);
  });
});
