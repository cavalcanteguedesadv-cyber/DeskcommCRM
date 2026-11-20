import { describe, expect, it } from "vitest";
import { variantesDoTelefone } from "./variantes-do-telefone";

describe("variantesDoTelefone", () => {
  it("com DDD e o 9, tenta também sem o 9", () => {
    expect(variantesDoTelefone("61996529869")).toEqual(["61996529869", "6196529869"]);
  });
  it("com país, DDD e o 9, tenta também sem o 9", () => {
    expect(variantesDoTelefone("5561996529869")).toContain("556196529869");
  });
  it("só o número com 9, tenta sem o 9", () => {
    expect(variantesDoTelefone("996529869")).toContain("96529869");
  });
  it("sem o 9, tenta também com o 9", () => {
    expect(variantesDoTelefone("6196529869")).toContain("61996529869");
    expect(variantesDoTelefone("556196529869")).toContain("5561996529869");
  });
  it("pedaço curto fica como está", () => {
    expect(variantesDoTelefone("9869")).toEqual(["9869"]);
  });
  it("telefone fixo não ganha 9", () => {
    expect(variantesDoTelefone("6133467767")).toEqual(["6133467767"]);
  });
});
